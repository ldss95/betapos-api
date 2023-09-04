import { NextFunction, Request, Response } from 'express'
import { ForeignKeyConstraintError, Op, UniqueConstraintError } from 'sequelize'

import { Sale } from './model'
import { SaleProduct } from '../sales-products/model'
import { Client } from '../clients/model'
import { User } from '../users/model'
import { Product } from '../products/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { createExcelFile, getAllSales, getSalesSummary, insertSale } from './services'
import { CustomError } from '../../utils/errors'

export default {
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { ticket } = req.body
			const merchantId = req.header('merchantId')
			const deviceId = req.header('deviceId')

			await insertSale(ticket, merchantId!, deviceId!)
			res.sendStatus(201)
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(error.status).send({
					message: error.message
				})
			}

			if (error instanceof UniqueConstraintError) {
				return res.sendStatus(201)
			}

			if (error instanceof ForeignKeyConstraintError) {
				return res.status(400).send({
					value: error.value,
					table: error.table,
					fields: error.fields,
					message: error.message
				})
			}

			res.status(500).send(error)
			next(error)
		}
	},
	update: async (req: Request, res: Response) => {
		const { id } = req.body

		await Sale.update(req.body, { where: { id } })
		res.sendStatus(200)
	},
	delete: async (req: Request, res: Response) => {
		const { id } = req.params
		await Sale.destroy({ where: { id } })
		res.sendStatus(200)
	},
	getAll: async (req: Request, res: Response) => {
		const { pagination, filters, sorter, search, dateFrom, dateTo, shiftId, ncfType } = req.body
		const { count, total, sales } = await getAllSales({
			pagination,
			filters,
			sorter,
			search,
			dateFrom,
			dateTo,
			shiftId,
			businessId: req.session!.businessId,
			ncfType
		})

		res.status(200).send({
			count,
			total,
			data: sales
		})
	},
	getOne: async (req: Request, res: Response) => {
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
	},
	removeProduct: async (req: Request, res: Response) => {
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
	},
	cancel: async (req: Request, res: Response) => {
		const { id } = req.params
		await Sale.update({ status: 'CANCELLED' }, { where: { id } })
		res.sendStatus(204)
	},
	getSummary: async (req: Request, res: Response) => {
		const { type } = req.params
		const { businessId } = req.session!
		const summary = await getSalesSummary(businessId, type)

		res.status(200).send(summary)
	},
	export: async (req: Request, res: Response) => {
		const { dateFrom, dateTo, ncfType } = req.query
		const { businessId } = req.session!
		const doc = await createExcelFile(businessId, dateFrom?.toString(), dateTo?.toString(), ncfType as ('01' | '02'))

		res.status(200).send(doc)
	}
}
