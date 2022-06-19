import { Request, Response } from 'express'
import { Op } from 'sequelize'

import { Sale } from './model'
import { SaleProduct } from '../sales-products/model'
import { Business } from '../business/model'
import { SalePayment } from '../sales-payments/model'
import { Device } from '../devices/model'
import { Client } from '../clients/model'
import { User } from '../users/model'
import { Product } from '../products/model'

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
	getAll: async (req: Request, res: Response) => {
		try {
			const { pagination, filters, sorter, search, dateFrom, dateTo, shiftId } = req.body
			const currentPage = pagination.current || 1
			const pageSize = pagination.pageSize || 100

			const where = {
				[Op.and]: [
					{ businessId: req.session!.businessId },
					{
						...(shiftId && { shiftId })
					},
					{
						...(filters.orderType && {
							orderType: {
								[Op.in]: filters.orderType
							}
						})
					},
					{
						...(filters.status && {
							status: {
								[Op.in]: filters.status
							}
						})
					},
					{
						...(search &&
							search !== '' &&
							Number(search) && {
							ticketNumber: {
								[Op.like]: `%${search}%`
							}
						})
					},
					{
						...(search &&
							isNaN(search) && {
							[Op.or]: [
								{
									'$client.name$': {
										[Op.like]: `%${search}%`
									}
								},
								{
									'$seller.lastName$': {
										[Op.like]: `%${search}%`
									}
								},
								{
									'$seller.firstName$': {
										[Op.like]: `%${search}%`
									}
								}
							]
						})
					},
					{
						...(dateFrom &&
							dateTo && {
							createdAt: {
								[Op.between]: [dateFrom + ' 00:00:00', dateTo + ' 23:59:59']
							}
						})
					},
					{
						...(dateFrom &&
							!dateTo && {
							createdAt: {
								[Op.gte]: dateFrom
							}
						})
					},
					{
						...(!dateFrom &&
							dateTo && {
							createdAt: {
								[Op.lte]: dateTo
							}
						})
					}
				]
			}

			const include = [
				{
					model: Client,
					as: 'client',
					required: false
				},
				{
					model: User,
					as: 'seller'
				}
			]

			const total = await Sale.count({ where, include })
			const sales = await Sale.findAll({
				where,
				include,
				order: [['createdAt', 'DESC']],
				limit: pageSize,
				offset: (currentPage - 1) * pageSize,
				...(sorter &&
					sorter.field && {
					order: [[sorter.field, sorter.order == 'ascend' ? 'ASC' : 'DESC']]
				})
			})

			res.status(200).send({
				total,
				data: sales
			})
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Sale.findOne({
			where: {
				[Op.and]: [{ id }, { businessId: req.session!.businessId }]
			},
			include: [
				{
					model: Client,
					as: 'client'
				},
				{
					model: User,
					as: 'seller'
				},
				{
					model: SaleProduct,
					as: 'products',
					include: [
						{
							model: Product,
							as: 'product'
						}
					]
				}
			]
		})
			.then((sale) => res.status(200).send(sale?.toJSON()))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
