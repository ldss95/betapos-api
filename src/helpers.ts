import AWS from 'aws-sdk'
import moment from 'moment'

import { db } from './database/firebase'

export function deleteFile(Key: string) {
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

type Table = 'users' | 'barcodes' | 'clients' | 'business' | 'products' | 'devices' | 'settings' | 'sales';
export function notifyUpdate(table: Table, merchantId?: string) {
	if (!merchantId) {
		return
	}

	db.collection(merchantId)
		.doc(table)
		.update({
			lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
		})
}

export function round(amount: number) {
	return Math.round(amount * 100) / 100
}
