import { Client, RemoteAuth } from 'whatsapp-web.js'
import fs, { ReadStream } from 'fs'
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3'

const { AWS_REGION, AWS_BUCKET_NAME } = process.env

export class WsClient {
	private static instance: WsClient
	private s3: S3
	public client: Client
	public qr: string | null = null
	public isReady = false

	private constructor() {
		this.s3 = new S3({
			region: AWS_REGION
		})

		this.client = new Client({
			authStrategy: new RemoteAuth({
				store: {
					sessionExists: async ({ session }) => {
						try {
							await this.s3.headObject({
								Key: `${session}.zip`,
								Bucket: AWS_BUCKET_NAME
							})

							return true
						} catch (error) {
							return false
						}
					},
					delete: async ({ session }) => {
						await this.s3.deleteObject({
							Bucket: AWS_BUCKET_NAME,
							Key: `${session}.zip`
						})
					},
					save: async ({ session }) => {
						const file = fs.createReadStream(`${session}.zip`)
						await this.s3.putObject({
							Bucket: AWS_BUCKET_NAME,
							Body: file,
							Key: `${session}.zip`
						})
					},
					extract: async ({ session, path }) => {
						const { Body } = await this.s3.send(new GetObjectCommand({
							Key: `${session}.zip`,
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
				backupSyncIntervalMs: 60000
			})
		})

		this.startWsClient()
	}

	public static getInstance(): WsClient {
		if (!WsClient.instance) {
			WsClient.instance = new WsClient()
		}

		return WsClient.instance
	}

	async startWsClient() {
		this.client?.on('qr', (qr) => this.qr = qr)
		this.client.on('ready', () => this.isReady = true)
		await this.client.initialize()
	}
}
