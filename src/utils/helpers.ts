import moment from 'moment'
import http from 'supertest'
import { Express } from 'express'
import { DeleteObjectCommandOutput, S3 } from '@aws-sdk/client-s3'

import { db } from '../database/firebase'

export function deleteFile(Key: string): Promise<DeleteObjectCommandOutput | undefined> {
	return new Promise((resolve, reject) => {
		const { AWS_REGION, BUCKET_NAME } = process.env

		const s3 = new S3({
			region: AWS_REGION
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

type Table = 'users' | 'barcodes' | 'clients' | 'business' | 'products' | 'devices' | 'settings' | 'sales' | 'scales';
export function notifyUpdate(table: Table, merchantId?: string) {
	if (!merchantId) {
		return
	}

	db.collection(merchantId)
		.doc(table)
		.set({
			lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
		})
}

export function round(amount: number) {
	return Math.round(amount * 100) / 100
}

export async function login4Tests(app: Express, session: { session: string; token: string }) {
	const { body, headers } = await http(app).post('/auth/login').send({
		email: 'lsantiago@pixnabilab.com',
		password: '123456'
	})

	session.token = body.token
	session.session = headers['set-cookie'][0]
		.split(',')
		.map((item: string) => item.split(';')[0])
		.join(';')
}

export function isValidRNC(rnc: string) {
	if (!rnc) {
		return false
	}

	if (rnc.length > 11) {
		return false
	}

	if (rnc.length < 9) {
		return false
	}

	if (rnc.length === 10) {
		return false
	}

	return true
}
