import { Request, Response } from 'express'
import { Op, UniqueConstraintError } from 'sequelize'
import { Business } from '../business/model'
import moment from 'moment'
import firebase from 'firebase-admin'

import { Os } from '../operative-systems/model'
import { Device } from './model'
import { db } from '../../database/firebase'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { merchantId, release, code } = req.body

			const business = await Business.findOne({ where: { merchantId } })
			if (!business) {
				return res.status(400).send({
					message: 'MerchantID invalido'
				})
			}

			const os = await Os.findOne({
				where: {
					[Op.and]: [{ release }, { code }]
				}
			})

			await Device.create({
				...req.body,
				businessId: business.id,
				...(os && { osId: os.id })
			})
			res.sendStatus(201)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				const device = await Device.findOne({ where: { deviceId: req.body.deviceId } })
				const { businessId } = device!
				const business = await Business.findOne({ where: { id: businessId } })
				const { merchantId } = business!

				if (merchantId == req.body.merchantId) {
					return res.sendStatus(201)
				}

				console.log('Registered With: ', merchantId, ' Sended Merchat ID: ', req.body.merchantId)
				return res.status(400).send({
					message: 'Esta PC se encuentra conectada con otra cuenta de negocios.'
				})
			}

			res.sendStatus(500)
			throw error
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const { id } = req.body
			const { merchantId } = req.session!

			await Device.update(req.body, { where: { id } })

			await db
				.collection(merchantId)
				.doc('devices')
				.update({
					lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
				})

			res.sendStatus(200)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	delete: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const { merchantId } = req.session!

			await Device.destroy({ where: { id } })

			await db
				.collection(merchantId)
				.doc('devices')
				.update({
					deleted: firebase.firestore.FieldValue.arrayUnion(id)
				})

			res.sendStatus(200)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!

		Device.findAll({
			where: { businessId },
			include: {
				model: Os,
				as: 'os'
			}
		})
			.then((devices) => res.status(200).send(devices))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getUpdates: async (req: Request, res: Response) => {
		try {
			const { date } = req.params
			const merchantId = req.header('merchantId')
			const deviceId = req.header('deviceId')

			const business = await Business.findOne({
				where: {
					merchantId
				}
			})

			if (!business || !business.isActive) {
				return res.sendStatus(400)
			}

			const device= await Device.findOne({
				where: {
					[Op.and]: [
						{ businessId: business.id },
						{ deviceId },
						{
							updatedAt: {
								[Op.gte]: date
							}
						}
					]
				}
			})

			res.status(200).send(device?.toJSON())
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
