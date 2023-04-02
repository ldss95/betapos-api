import { Client, RemoteAuth } from 'whatsapp-web.js'
import fs, { ReadStream } from 'fs'
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3'
import { Configuration, OpenAIApi, ChatCompletionRequestMessageRoleEnum } from 'openai'
import { WsSession } from './components/ws/model'

const { AWS_REGION, AWS_BUCKET_NAME, OPEN_AI_API_KEY } = process.env
const openAiConf = new Configuration({
	apiKey: OPEN_AI_API_KEY
})
const menu = [
	{
		name: 'Papas fritas',
		categories: ['Guarnicion'],
		price: 106.2,
		description: null
	},
	{
		name: 'Juancito el Caminador',
		categories: ['Los de pierna', 'Los de pollo'],
		price: 224,
		description: 'Pan cuadrado, integral o de agua, pierna o pollo, queso cheddar, queso danés, jamón, tomate y lechuga'
	},
	{
		name: 'Sandwich de tuna',
		categories: [],
		price: 270,
		description: 'Pan cuadrado, integral o de agua, tuna, lechuga y tomate.'
	},
	{
		name: 'Club Sandwich Pierna',
		categories: ['Los de pierna'],
		price: 377.6,
		description: 'Pan cuadraro, integral o de agua, pierna, queso cheddar, queso danes, jamon y tomate'
	},
	{
		name: 'Club Sandwich Pollo',
		categories: ['Los de pollo'],
		price: 377.6,
		description: 'Pan cuadraro, integral o de agua, pollo, queso cheddar, queso danes, jamon y tomate'
	},
	{
		name: 'China con Carnation',
		categories: ['Batidas', 'Bebidas'],
		price: 236,
		description: null
	}
]
const tunePrompt = {
	role: ChatCompletionRequestMessageRoleEnum.User,
	content:
		`Para todas las siguientes respuestas, sigue las siguientes reglas:
		1: Eres un chatbot de la empresa Barra Jr. Payan
		2: Tu proposito es ayudar a los clientes a hacer ordenes
		3: El horario de las tiendas es de 9 AM a 11 PM
		4: El menu disponible es el siguiente JSON: (
			${JSON.stringify(menu)}
		)
	`
}

export default class WsClient {
	private static instances: WsClient[] = []
	private s3: S3
	private sessionRestored = false
	private openai: OpenAIApi
	private context: { role: ChatCompletionRequestMessageRoleEnum; content: string; }[]  = []

	public client: Client
	public qr: string | null = null
	public isReady = false
	public merchantId: string

	private constructor(merchantId: string, businessId: string) {
		this.merchantId = merchantId

		this.s3 = new S3({
			region: AWS_REGION
		})

		this.client = new Client({
			authStrategy: new RemoteAuth({
				store: {
					sessionExists: async () => {
						try {
							await this.s3.headObject({
								Key: `ws_sessions/${this.merchantId}.zip`,
								Bucket: AWS_BUCKET_NAME
							})

							this.sessionRestored = true
							return true
						} catch (error) {
							return false
						}
					},
					delete: async () => {
						await this.s3.deleteObject({
							Bucket: AWS_BUCKET_NAME,
							Key: `ws_sessions/${this.merchantId}.zip`
						})
					},
					save: async ({ session }) => {
						const file = fs.createReadStream(`${session}.zip`)
						await this.s3.putObject({
							Bucket: AWS_BUCKET_NAME,
							Body: file,
							Key: `ws_sessions/${this.merchantId}.zip`
						})
					},
					extract: async ({ path }) => {
						const { Body } = await this.s3.send(new GetObjectCommand({
							Key: `ws_sessions/${this.merchantId}.zip`,
							Bucket: AWS_BUCKET_NAME
						}))

						const rs = Body as unknown as ReadStream
						const ws = fs.createWriteStream(path)
						rs.pipe(ws)

						return new Promise((resolve, reject) => {
							rs.on('end', resolve)
							rs.on('error', reject)
						})
					},
				},
				backupSyncIntervalMs: 60000,
				clientId: merchantId
			})
		})

		this.openai = new OpenAIApi(openAiConf)

		this.startWsClient(businessId)
	}

	public static getInstance(merchantId: string, businessId: string): WsClient {
		const instance = WsClient.instances.find((instance) => instance.merchantId === merchantId)
		if (instance) {
			return instance
		}

		WsClient.instances.push(
			new WsClient(merchantId, businessId)
		)

		return this.getInstance(merchantId, businessId)
	}

	async startWsClient(businessId: string) {
		try {

			const { data } = await this.openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [tunePrompt],
				n: 1
			})
			this.context.push(tunePrompt)
			this.context.push({
				content: `${data.choices[0].message}`,
				role: ChatCompletionRequestMessageRoleEnum.System,
			})

			this.client?.on('qr', (qr) => this.qr = qr)
			this.client.on('ready', async () => {
				this.isReady = true
				if (!this.sessionRestored) {
					await WsSession.create({ businessId })
				}
			})
			this.client.on('message', async (msg) => {
				try {
					let message = msg.body

					if (!message.includes('IA:')) {
						return
					}

					message = message.replace('IA:', '')
					this.context.push({
						role: ChatCompletionRequestMessageRoleEnum.User,
						content: message
					})
					const { data } = await this.openai.createChatCompletion({
						model: 'gpt-3.5-turbo',
						messages: this.context,
						n: 1
					})

					const response = data.choices[0].message?.content

					this.context.push({
						role: ChatCompletionRequestMessageRoleEnum.System,
						content: response!
					})
					msg.reply(response!)
				} catch (error) {
					console.log(JSON.stringify(error))
				}
			})
			await this.client.initialize()

		} catch (error) {
			console.log(JSON.stringify(error))
		}
	}
}
