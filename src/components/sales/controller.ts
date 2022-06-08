import { Request, Response } from 'express'

import { Sale } from './model'
import { SaleProduct } from '../sale-products/model'

export default {
	create: (req: Request, res: Response) => {
		const { ticket } = req.body
		console.log(ticket)
		Sale.create(ticket, {
			include: {
				model: SaleProduct,
				as: 'products'
			}
		})
			.then(() => res.sendStatus(201))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
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
