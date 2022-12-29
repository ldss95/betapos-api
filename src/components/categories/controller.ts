import { NextFunction, Request, Response } from 'express'
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize'

import { Category } from './model'

export default {
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const category = {
				...req.body,
				businessId: req.session!.businessId
			}

			await Category.create(category)
			res.sendStatus(201)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return res.status(400).send({
					message: `Ya existe una categoría con el nombre "${req.body.name}"`
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.body

			await Category.update(req.body, { where: { id } })
			res.sendStatus(200)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return res.status(400).send({
					message: `Ya existe una categoría con el nombre "${req.body.name}"`
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	delete: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params

			await Category.destroy({ where: { id } })
			res.sendStatus(200)
		} catch (error) {
			if (error instanceof ForeignKeyConstraintError) {
				return res.status(400).send({
					message: 'Esta categoria no puede ser eliminada ya que está en uso'
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId } = req.session!

			const categories = await Category.findAll({ where: { businessId }, order: [['name', 'ASC']] })
			res.status(200).send(categories)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getOne: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params

			const category = await Category.findOne({ where: { id } })
			res.status(200).send(category)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
