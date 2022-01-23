import { Request, Response } from 'express'
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize'

import { Brand } from './model'

export default {
	create: (req: Request, res: Response) => {
		const brand = {
			...req.body,
			businessId: req.session!.businessId,
		}

		Brand.create(brand)
			.then(() => res.sendStatus(201))
			.catch((error) => {
				if (error instanceof UniqueConstraintError) {
					return res.status(400).send({
						message: `Ya existe una categoría con el nombre "${req.body.name}"`
					})
				}

				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Brand.update(req.body, { where: { id } })
			.then(() => res.sendStatus(200))
			.catch((error) => {
				if (error instanceof UniqueConstraintError) {
					return res.status(400).send({
						message: `Ya existe una marca con el nombre "${req.body.name}"`
					})
				}

				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params

		Brand.destroy({ where: { id } })
			.then(() => res.sendStatus(200))
			.catch((error) => {
				if(error instanceof ForeignKeyConstraintError) {
					res.status(400).send({
						message: 'Esta marca no puede ser eliminada ya que está en uso'
					})
				}

				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!

		Brand.findAll({ where: { businessId }, order: [['name', 'ASC']] })
			.then((categories) => res.status(200).send(categories))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Brand.findOne({ where: { id } })
			.then((Brand) => res.status(200).send(Brand))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
}
