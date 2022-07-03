import { Request, Response } from 'express'
import { Op } from 'sequelize'

import { SaleProduct } from '../sales-products/model'
import { Sale } from '../sales/model'

export default {
	getAll: async (req: Request, res: Response) => {
		interface ReqBodyProps {
			groupBy: 'sale' | 'day' | 'week' | 'month' | 'trimester' | 'year';
			dateFrom: string;
			dateTo: string;
		}
		const { groupBy, dateFrom, dateTo } = req.query
		const { businessId } = req.session!

		const sales = await Sale.findAll({
			include: [
				{
					model: SaleProduct,
					as: 'products'
				}
			],
			where: {
				businessId,
				...(dateFrom &&
					dateTo && {
					createdAt: {
						[Op.between]: [`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`]
					}
				}),
				...(dateFrom &&
					!dateTo && {
					createdAt: {
						[Op.gte]: `${dateFrom} 00:00:00`
					}
				}),
				...(!dateFrom &&
					dateTo && {
					createdAt: {
						[Op.lte]: `${dateTo} 00:00:00`
					}
				})
			},
			order: [['createdAt', 'DESC']]
		})

		const profits = sales.map(({ products, ticketNumber, createdAt, id }) => {
			return {
				id,
				ticketNumber,
				date: createdAt,
				profits: products.reduce((total, { cost, price, quantity }) => total + (price - cost) * quantity, 0)
			}
		})

		res.status(200).send({
			profits,
			total: profits.reduce((total, { profits }) => total + profits, 0)
		})
	}
}
