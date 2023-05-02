import { NextFunction, Request, Response } from 'express'
import { Op, UniqueConstraintError } from 'sequelize'
import { Business } from '../business/model'

import { Os } from '../operative-systems/model'
import { Device } from './model'
import { notifyUpdate } from '../../utils/helpers'

export default {
	create: async (req: Request, res: Response, next: NextFunction) => {
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

				return res.status(400).send({
					message: 'Esta PC se encuentra conectada con otra cuenta de negocios.'
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	update: async (req: Request, res: Response) => {
		const { id } = req.body
		const { merchantId } = req.session!

		await Device.update(req.body, { where: { id } })
		notifyUpdate('devices', merchantId)

		res.sendStatus(200)
	},
	delete: async (req: Request, res: Response) => {
		const { id } = req.params
		const { merchantId } = req.session!

		await Device.destroy({ where: { id } })
		notifyUpdate('devices', merchantId)

		res.sendStatus(200)
	},
	getAll: async (req: Request, res: Response) => {
		const { businessId } = req.session!

		const devices = await Device.findAll({
			where: { businessId },
			include: {
				model: Os,
				as: 'os'
			}
		})
		res.status(200).send(devices)
	},
	getUpdates: async (req: Request, res: Response) => {
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

		const device = await Device.findOne({
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
	}
}
