import AWS from 'aws-sdk'
import { CronJob } from 'cron'
import moment from 'moment'

import { Bill } from './components/billing/model'
import { Business } from './components/business/model'
import { Device } from './components/devices/model'

function deleteFile(Key: string) {
	return new Promise((resolve, reject) => {
		const { S3_ENDPOINT, AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, BUCKET_NAME } = process.env

		const spacesEndpoint = new AWS.Endpoint(`${S3_ENDPOINT}`)
		const s3 = new AWS.S3({
			endpoint: spacesEndpoint,
			secretAccessKey: AWS_SECRET_ACCESS_KEY,
			accessKeyId: AWS_ACCESS_KEY_ID
		})

		s3.deleteObject({ Bucket: `${BUCKET_NAME}`, Key }, (error, data) => {
			if (error) {
				reject(error)
			} else {
				resolve(data)
			}
		})
	})
}

function startBillGenerator() {
	new CronJob('0 0 8 28 * *', generateBills, null, true, 'America/Santo_Domingo')
}

async function generateBills() {
	const clients = await Business.findAll({
		include: {
			model: Device,
			as: 'devices',
			required: true
		}
	})

	for (const client of clients) {
		const devices = client.devices.length

		const amount = devices > 2 ? 1000 + (devices - 2) * 1000 : 1000

		const lastOrderNumber: number = await Bill.max('orderNumber')

		await Bill.create({
			businessId: client.id,
			orderNumber: `${+lastOrderNumber + 1}`.padStart(8, '0'),
			amount,
			description: `Pago por uso Beta POS ${moment().format('MMMM YYYY')}`
		})
	}
}

export { deleteFile, startBillGenerator }
