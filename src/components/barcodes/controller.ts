import { Request, Response } from 'express'
import moment from 'moment'
import { Op } from 'sequelize'
import firebase from 'firebase-admin'

import { db } from '../../database/firebase'
import { Barcode } from './model'
import { Business } from '../business/model'
import { Product } from '../products/model'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { barcode, productId } = req.body
			const { merchantId } = req.session!

			await Barcode.create({ barcode, productId })
			await db
				.collection(merchantId)
				.doc('barcodes')
				.update({
					lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
				})

			res.sendStatus(201)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const { id, barcode } = req.body
			const { merchantId } = req.session!

			await Barcode.update({ barcode }, { where: { id } })
			await db
				.collection(merchantId)
				.doc('barcodes')
				.update({
					lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
				})

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	delete: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const { merchantId } = req.session!

			await Barcode.destroy({ where: { id } })

			await db
				.collection(merchantId)
				.doc('barcodes')
				.update({
					deleted: firebase.firestore.FieldValue.arrayUnion(id)
				})
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getUpdates: async (req: Request, res: Response) => {
		try {
			const { date } = req.params
			const merchantId = req.header('merchantId')

			const business = await Business.findOne({
				where: {
					merchantId
				}
			})

			if (!business || !business.isActive) {
				return res.sendStatus(400)
			}

			const created = await Barcode.findAll({
				attributes: ['id', 'barcode', 'productId'],
				where: {
					...(date != 'ALL' && {
						createdAt: { [Op.gte]: date }
					})
				},
				include: {
					model: Product,
					as: 'product',
					where: {
						businessId: business.id
					},
					required: true
				},
				raw: true
			})
			const updated = await Barcode.findAll({
				attributes: ['id', 'barcode', 'productId'],
				where: {
					...(date != 'ALL' && {
						updatedAt: { [Op.gte]: date }
					})
				},
				include: {
					model: Product,
					as: 'product',
					where: {
						businessId: business.id
					},
					required: true
				},
				raw: true
			})

			res.status(200).send({ created, updated })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
