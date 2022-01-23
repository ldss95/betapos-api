import { Request, Response } from 'express'
import { Barcode } from '../barcodes/model'
import { Brand } from '../brands/model'
import { Category } from '../categories/model'
// import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'

import { Product } from './model'

export default {
	create: (req: Request, res: Response) => {
		const { businessId } = req.session!

		Product.create(
			{ ...req.body, businessId },
			{
				include: {
					model: Barcode,
					as: 'barcodes'
				}
			}
		)
			.then(() => res.sendStatus(201))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Product.update(req.body, { where: { id } })
			.then(() => res.sendStatus(204))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params

		Product.destroy({ where: { id } })
			.then(() => res.sendStatus(204))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		Product.findAll({
			include: [
				{
					model: Barcode,
					as: 'barcodes',
					required: false
				},
				{
					model: Brand,
					as: 'brand',
					required: false
				},
				{
					model: Category,
					as: 'category',
					required: false
				}
			]
		})
			.then((products) => res.status(200).send(products))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Product.findOne({ where: { id } })
			.then((model) => res.status(200).send(model))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
