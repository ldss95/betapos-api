import { Request, Response } from 'express'
import { deleteFile } from '../../helpers'
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
			.then(({ id }) => res.status(201).send({ id }))
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
			],
			where: {
				businessId: req.session!.businessId
			}
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
			.then((product) => res.status(200).send(product))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	addPhoto: async (req: any, res: Response) => {
		try {
			const { file } = req
			let { location } = file
			if (location.substr(0, 8) != 'https://') {
				location = `https://${location}`
			}

			const { id } = req.body

			const product = await Product.findOne({ where: { id } })

			// Delte current photo if exists
			if (product?.photoUrl && product.photoUrl != location) {
				let key = product.photoUrl.split('/images/').pop()
				key = 'images/' + key
				deleteFile(key)
			}

			await product!.update({ photoUrl: location })
			res.status(200).send({ photoUrl: location })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
