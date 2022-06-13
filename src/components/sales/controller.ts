import { Request, Response } from 'express'

import { Sale } from './model'
import { SaleProduct } from '../sales-products/model'
import { Business } from '../business/model'
import { SalePayment } from '../sales-payments/model'
import { Device } from '../devices/model'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { ticket } = req.body
			const merchantId = req.header('merchantId')
			const business = await Business.findOne({
				where: { merchantId }
			})

			if (!business || !business.isActive) {
				return res.status(400).send({
					message: 'Invalida MERCHANT ID'
				})
			}

			const device = await Device.findOne({
				where: { deviceId: req.header('deviceId') }
			})

			if (!device || !device.isActive) {
				return res.status(400).send({
					message: 'Device not allowed'
				})
			}

			await Sale.create(
				{
					...ticket,
					businessId: business.id,
					sellerId: ticket.userId,
					deviceId: device.id
				},
				{
					include: [
						{
							model: SaleProduct,
							as: 'products'
						},
						{
							model: SalePayment,
							as: 'payments'
						}
					]
				}
			)
			res.sendStatus(201)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Sale.update(req.body, { where: { id } })
			.then(() => res.sendStatus(200))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params

		Sale.destroy({ where: { id } })
			.then(() => res.sendStatus(200))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		Sale.findAll({
			where: {
				businessId: req.session!.businessId
			},
			order: [['createdAt', 'DESC']]
		})
			.then((Sale) => res.status(200).send(Sale))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Sale.findOne({ where: { id } })
			.then((Sale) => res.status(200).send(Sale))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
