import { Request, Response } from 'express'
import { Op, fn, col } from 'sequelize'

import { Client } from './model'
import { Business } from '../business/model'
import { deleteFile, notifyUpdate } from '../../utils/helpers'
import { Sale } from '../sales/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { ClientPayment } from '../clients-payments/model'
import { SalePayment } from '../sales-payments/model'
import { availableClientCredit, getClientCreditDetails } from './services'
import { ClientsGroup } from '../clients-groups/model'
import { saveHistory } from '../history/services'
import { CustomError, CustomErrorType } from '../../utils/errors'
import { Table } from '../history/interface'

export default {
	create: async (req: Request, res: Response) => {
		const { businessId, merchantId } = req.session!

		const { id } = await Client.create({ ...req.body, businessId })
		notifyUpdate('clients', merchantId)

		res.status(201).send({ id })
	},
	update: async (req: Request, res: Response) => {
		const { id } = req.body
		const { merchantId } = req.session!
		const agent = req.headers['user-agent']
		const { userId } = req.session!

		const client = await Client.findByPk(id)
		if (!client) {
			throw new CustomError({
				name: 'Cliente no encontrado',
				description: 'El ID proporcionado no es correcto',
				type: CustomErrorType.RECORD_NOT_FOUND
			})
		}

		const before = client.toJSON()
		await client.update(req.body)
		notifyUpdate('clients', merchantId)

		await saveHistory({
			before,
			after: req.body,
			ip: req.ip,
			agent,
			table: Table.CLIENTS,
			userId,
			identifier: client.id
		})

		res.sendStatus(204)
	},
	delete: async (req: Request, res: Response) => {
		const { id } = req.params
		const { merchantId } = req.session!

		await Client.destroy({ where: { id }, force: true })
		notifyUpdate('clients', merchantId)
		res.sendStatus(204)
	},
	getAll: async (req: Request, res: Response) => {
		const clients = await Client.findAll({
			include: {
				model: ClientsGroup,
				as: 'group'
			},
			where: { businessId: req.session!.businessId }
		})
		res.status(200).send(clients)
	},
	getOne: async (req: Request, res: Response) => {
		const { id } = req.params

		const client = await Client.findOne({
			include: {
				model: ClientsGroup,
				as: 'group'
			},
			where: { id }
		})

		res.status(200).send(client)
	},
	addPhoto: async (req: Request, res: Response) => {
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
	},
	getUpdates: async (req: Request, res: Response) => {
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
	},
	getPending: async (req: Request, res: Response) => {
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
	},
	getPendingDetails: async (req: Request, res: Response) => {
		const { clientId } = req.params
		const data = await getClientCreditDetails(clientId)
		res.status(200).send(data)
	},
	getAvailableCredit: async (req: Request, res: Response) => {
		const { id } = req.params
		const available = await availableClientCredit(id)

		res.status(200).send({ available })
	}
}
