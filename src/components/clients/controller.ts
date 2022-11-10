import { Request, Response } from 'express'
import moment from 'moment'
import { Op, fn, col } from 'sequelize'

import { Client } from './model'
import { Business } from '../business/model'
import { deleteFile, notifyUpdate } from '../../helpers'
import { Sale } from '../sales/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { ClientPayment } from '../clients-payments/model'
import { SalePayment } from '../sales-payments/model'
import { User } from '../users/model'
import { ClientPaymentProps } from '../clients-payments/interface'
import { SaleProps } from '../sales/interface'
import { availableClientCredit } from './services'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { businessId, merchantId } = req.session!

			const { id } = await Client.create({ ...req.body, businessId })
			notifyUpdate('clients', merchantId)

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
			notifyUpdate('clients', merchantId)

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

			await Client.destroy({ where: { id }, force: true })
			notifyUpdate('clients', merchantId)
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
	addPhoto: async (req: Request, res: Response) => {
		try {
			let { location } = req.file as Express.MulterS3.File
			const { merchantId } = req.session!
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
			notifyUpdate('clients', merchantId)
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
	},
	getPending: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			const paymentType = await SalePaymentType.findOne({
				where: {
					name: 'Fiao'
				}
			})

			if (!paymentType) {
				res.sendStatus(500)
				throw new Error('Tipo de pago "Fiao" no encontrado')
			}

			const clients = await Client.findAll({
				attributes: {
					include: [
						[fn('sum', col('sales->payments.amount')), 'debt']
					]
				},
				where: { businessId },
				include: [
					{
						model: Sale,
						as: 'sales',
						where: {
							status: 'DONE'
						},
						include: [{
							model: SalePayment,
							as: 'payments',
							where: {
								typeId: paymentType.id
							}
						}],
						required: true
					},
					{
						model: ClientPayment,
						as: 'payments',
						separate: true
					}
				],
				group: 'client.id'
			})

			res.status(200).send(
				clients.map((client) => ({
					...client.toJSON(),
					payed: client.payments.reduce((total, { amount }) => total + amount, 0)
				}))
			)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getPendingDetails: async (req: Request, res: Response) => {
		try {
			const { clientId } = req.params

			const sales = await Sale.findAll({
				where: { clientId },
				include: [
					{
						model: SalePayment,
						include: [
							{
								model: SalePaymentType,
								as: 'type',
								where: {
									name: 'Fiao'
								},
								required: true
							}
						],
						as: 'payments',
						required: true
					},
					{
						model: User,
						as: 'seller',
						paranoid: false
					}
				]
			})


			const payments = await ClientPayment.findAll({
				where: { clientId },
				include: {
					model: User,
					as: 'user',
					paranoid: false
				}
			})

			const data: any = [...payments, ...sales]
				.sort((a: SaleProps | ClientPaymentProps, b: SaleProps | ClientPaymentProps) => {
					return moment(b.createdAt).toDate().getTime() - moment(a.createdAt).toDate().getTime()
				})
				.reverse()

			let lastPending = 0
			for (let i = 0; i < data.length; i++) {
				const item = data[i]
				const type: 'SALE' | 'PAYMENT' = item?.ticketNumber ? 'SALE' : 'PAYMENT'

				if (type == 'PAYMENT') {
					lastPending -= item.amount
					data[i] = {
						...item.toJSON(),
						pending: lastPending
					}
				}

				if (type == 'SALE') {
					const [payment] = item.payments
					lastPending += payment.amount
					data[i] = {
						...item.toJSON(),
						pending: lastPending
					}
				}
			}

			res.status(200).send(data.reverse())
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getAvailableCredit: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const available = await availableClientCredit(id)

			res.status(200).send({ available })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
