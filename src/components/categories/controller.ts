import { Request, Response } from 'express'
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize'

import { Category } from './model'

export default {
	create: (req: Request, res: Response) => {
		const category = {
			...req.body,
			businessId: req.session!.businessId
		}

		Category.create(category)
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

		Category.update(req.body, { where: { id } })
			.then(() => res.sendStatus(200))
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
	delete: (req: Request, res: Response) => {
		const { id } = req.params

		Category.destroy({ where: { id } })
			.then(() => res.sendStatus(200))
			.catch((error) => {
				if (error instanceof ForeignKeyConstraintError) {
					return res.status(400).send({
						message: 'Esta categoria no puede ser eliminada ya que está en uso'
					})
				}

				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!

		Category.findAll({ where: { businessId }, order: [['name', 'ASC']] })
			.then((categories) => res.status(200).send(categories))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Category.findOne({ where: { id } })
			.then((category) => res.status(200).send(category))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
