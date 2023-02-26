import { NextFunction, Request, Response } from 'express'
import { ForeignKeyConstraintError, Op, UniqueConstraintError } from 'sequelize'

import { Sale } from './model'
import { SaleProduct } from '../sales-products/model'
import { Business } from '../business/model'
import { SalePayment } from '../sales-payments/model'
import { Device } from '../devices/model'
import { Client } from '../clients/model'
import { User } from '../users/model'
import { Product } from '../products/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { createExcelFile, getAllSales, getSalesSummary } from './services'
import { notifyUpdate } from '../../helpers'

export default {
	create: async (req: Request, res: Response, next: NextFunction) => {
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
			notifyUpdate('sales', merchantId)
			res.sendStatus(201)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return res.sendStatus(201)
			}

			if (error instanceof ForeignKeyConstraintError) {
				return res.status(400).send({
					message: ''
				})
			}

			res.status(500).send(error)
			next(error)
		}
	},
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.body

			await Sale.update(req.body, { where: { id } })
			res.sendStatus(200)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	delete: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			await Sale.destroy({ where: { id } })
			res.sendStatus(200)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { pagination, filters, sorter, search, dateFrom, dateTo, shiftId } = req.body
			const { count, total, sales } = await getAllSales({
				pagination,
				filters,
				sorter,
				search,
				dateFrom,
				dateTo,
				shiftId,
				businessId: req.session!.businessId
			})

			res.status(200).send({
				count,
				total,
				data: sales
			})
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getOne: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params

			const sale = await Sale.findOne({
				where: {
					[Op.and]: [{ id }, { businessId: req.session!.businessId }]
				},
				include: [
					{
						model: Client,
						as: 'client',
						paranoid: false
					},
					{
						model: User,
						as: 'seller',
						paranoid: false
					},
					{
						model: SaleProduct,
						as: 'products',
						include: [
							{
								model: Product,
								as: 'product',
								paranoid: false
							}
						],
						paranoid: false
					},
					{
						model: SalePaymentType,
						as: 'paymentType'
					}
				]
			})
			res.status(200).send(sale?.toJSON())
		} catch(error) {
			res.sendStatus(500)
			next(error)
		}
	},
	removeProduct: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			const config = {
				where: {
					id
				}
			}

			const product = await SaleProduct.findOne(config)
			if (!product) {
				return res.sendStatus(204)
			}

			await product.destroy()
			const sale = await Sale.findOne({
				where: {
					id: product.saleId
				}
			})

			await sale?.update({
				amount: sale.amount - product.quantity * product.price
			})

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	cancel: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			await Sale.update({ status: 'CANCELLED' }, { where: { id } })
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getSummary: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { type } = req.params
			const { businessId } = req.session!
			const summary = await getSalesSummary(businessId, type)

			res.status(200).send(summary)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	export: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { dateFrom, dateTo } = req.query
			const { businessId } = req.session!
			const doc = await createExcelFile(businessId, dateFrom?.toString(), dateTo?.toString())

			res.status(200).send(doc)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
