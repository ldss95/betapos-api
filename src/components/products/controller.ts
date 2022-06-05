import { Request, Response } from 'express'
import { Op } from 'sequelize'
import moment from 'moment'
import firebase from 'firebase-admin'

import { db } from '../../database/firebase'
import { deleteFile } from '../../helpers'
import { Barcode } from '../barcodes/model'
import { Brand } from '../brands/model'
import { Category } from '../categories/model'
// import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'

import { Product } from './model'
import { Business } from '../business/model'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { businessId, merchantId } = req.session!

			const { id } = await Product.create(
				{ ...req.body, businessId },
				{
					include: {
						model: Barcode,
						as: 'barcodes'
					}
				}
			)

			await db
				.collection(merchantId)
				.doc('products')
				.update({
					lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
				})

			res.status(201).send({ id })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const { id } = req.body
			const { merchantId } = req.session!

			Product.update(req.body, { where: { id } })
			await db
				.collection(merchantId)
				.doc('products')
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

			await Product.destroy({ where: { id } })

			await db
				.collection(merchantId)
				.doc('products')
				.update({
					deleted: firebase.firestore.FieldValue.arrayUnion(id)
				})

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getAll: (req: Request, res: Response) => {
		Product.findAll({
			include: [
				{
					model: Barcode,
					as: 'barcodes',
					required: false
				},
				{
					model: Brand,
					as: 'brand',
					required: false
				},
				{
					model: Category,
					as: 'category',
					required: false
				}
			],
			where: {
				businessId: req.session!.businessId
			}
		})
			.then((products) => res.status(200).send(products))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Product.findOne({ where: { id } })
			.then((product) => res.status(200).send(product))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	addPhoto: async (req: any, res: Response) => {
		try {
			const { file } = req
			let { location } = file
			if (location.substr(0, 8) != 'https://') {
				location = `https://${location}`
			}

			const { id } = req.body

			const product = await Product.findOne({ where: { id } })

			// Delte current photo if exists
			if (product?.photoUrl && product.photoUrl != location) {
				let key = product.photoUrl.split('/images/').pop()
				key = 'images/' + key
				deleteFile(key)
			}

			await product!.update({ photoUrl: location })
			res.status(200).send({ photoUrl: location })
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

			const created = await Product.findAll({
				where: {
					...(date != 'ALL' && {
						createdAt: { [Op.gte]: date }
					}),
					businessId: business.id
				},
				include: {
					model: Barcode,
					as: 'barcodes'
				}
			})
			const updated = await Product.findAll({
				where: {
					...(date != 'ALL' && {
						updatedAt: { [Op.gte]: date }
					}),
					businessId: business.id
				},
				raw: true
			})

			res.status(200).send({
				created: created.map((product) => product.toJSON()),
				updated
			})
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
