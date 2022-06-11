import { Request, Response } from 'express'
import moment from 'moment'
import firebase from 'firebase-admin'
import { Op } from 'sequelize'

import { db } from '../../database/firebase'
import { Client } from './model'
import { Business } from '../business/model'
import { deleteFile } from '../../helpers'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { businessId, merchantId } = req.session!

			const { id } = await Client.create({ ...req.body, businessId })
			await db
				.collection(merchantId)
				.doc('clients')
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

			await Client.update(req.body, { where: { id } })
			await db
				.collection(merchantId)
				.doc('clients')
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

			await Client.destroy({ where: { id } })
			await db
				.collection(merchantId)
				.doc('clients')
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
		Client.findAll({ where: { businessId: req.session!.businessId } })
			.then((clients) => res.status(200).send(clients))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Client.findOne({ where: { id } })
			.then((client) => res.status(200).send(client))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	addPhoto: async (req: any, res: Response) => {
		try {
			const { file } = req
			const { merchantId } = req.session!
			let { location } = file
			if (location.substr(0, 8) != 'https://') {
				location = `https://${location}`
			}

			const { id } = req.body

			const client = await Client.findOne({ where: { id } })

			// Delte current photo if exists
			if (client?.photoUrl && client.photoUrl != location) {
				let key = client.photoUrl.split('/images/').pop()
				key = 'images/' + key
				deleteFile(key)
			}

			await client!.update({ photoUrl: location })
			await db
				.collection(merchantId)
				.doc('clients')
				.update({
					lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
				})
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

			const created = await Client.findAll({
				where: {
					...(date != 'ALL' && {
						createdAt: { [Op.gte]: date }
					}),
					businessId: business.id
				},
				raw: true
			})
			const updated = await Client.findAll({
				where: {
					...(date != 'ALL' && {
						updatedAt: { [Op.gte]: date }
					}),
					businessId: business.id
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
