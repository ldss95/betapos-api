import { Request, Response } from 'express'
import { Op, fn, col, literal } from 'sequelize'

import { SaleProduct } from '../sales-products/model'
import { Sale } from '../sales/model'

export default {
	getAll: async (req: Request, res: Response) => {
		try {
			interface ReqBodyProps {
				groupBy: 'TICKET' | 'DAY' | 'MONTH' | 'YEAR';
				dateFrom: string;
				dateTo: string;
			}
			const { groupBy, dateFrom, dateTo } = req.query as unknown as ReqBodyProps
			const { businessId } = req.session!

			if (groupBy == 'TICKET') {
				const sales = await Sale.findAll({
					include: [
						{
							model: SaleProduct,
							as: 'products'
						}
					],
					where: {
						businessId,
						createdAt: {
							[Op.between]: [`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`]
						}
					},
					order: [['createdAt', 'DESC']]
				})

				const profits = sales.map(({ products, ticketNumber, createdAt, id }) => {
					return {
						id,
						ticketNumber,
						date: createdAt,
						profits: products.reduce(
							(total, { cost, price, quantity }) => total + (price - cost) * quantity,
							0
						)
					}
				})

				return res.status(200).send({
					profits,
					total: profits.reduce((total, { profits }) => total + profits, 0)
				})
			}

			if (groupBy == 'DAY') {
				const days = await SaleProduct.findAll({
					attributes: [
						[
							literal(`
								SUM(quantity * (price - cost))
							`),
							'profits'
						],
						'createdAt'
					],
					include: [
						{
							model: Sale,
							as: 'sale',
							where: {
								businessId
							},
							required: true,
							attributes: []
						}
					],
					where: {
						createdAt: {
							[Op.between]: [`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`]
						}
					},
					order: [['createdAt', 'DESC']],
					group: [fn('DATE', col('sales_product.createdAt'))],
					raw: true
				})

				return res.status(200).send({
					profits: days,
					total: days.reduce((total, { profits }: any) => total + profits, 0)
				})
			}

			if (groupBy == 'MONTH') {
				const days = await SaleProduct.findAll({
					attributes: [
						[
							literal(`
								SUM(quantity * (price - cost))
							`),
							'profits'
						],
						'createdAt'
					],
					include: [
						{
							model: Sale,
							as: 'sale',
							where: {
								businessId
							},
							required: true,
							attributes: []
						}
					],
					where: {
						createdAt: {
							[Op.between]: [`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`]
						}
					},
					order: [['createdAt', 'DESC']],
					group: [fn('MONTH', col('sales_product.createdAt')), fn('YEAR', col('sales_product.createdAt'))],
					raw: true
				})

				return res.status(200).send({
					profits: days,
					total: days.reduce((total, { profits }: any) => total + profits, 0)
				})
			}

			if (groupBy == 'YEAR') {
				const days = await SaleProduct.findAll({
					attributes: [
						[
							literal(`
								SUM(quantity * (price - cost))
							`),
							'profits'
						],
						'createdAt'
					],
					include: [
						{
							model: Sale,
							as: 'sale',
							where: {
								businessId
							},
							required: true,
							attributes: []
						}
					],
					where: {
						createdAt: {
							[Op.between]: [`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`]
						}
					},
					order: [['createdAt', 'DESC']],
					group: [fn('YEAR', col('sales_product.createdAt'))],
					raw: true
				})

				return res.status(200).send({
					profits: days,
					total: days.reduce((total, { profits }: any) => total + profits, 0)
				})
			}
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
