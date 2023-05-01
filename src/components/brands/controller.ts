import { NextFunction, Request, Response } from 'express'
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize'

import { createBrand, deleteBrand, getOneBrand, listAllBrands, updateBrand } from './services'

export default {
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			await createBrand(req.body.name, req.session!.businessId)
			res.sendStatus(201)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return res.status(400).send({
					message: `Ya existe una marca con el nombre "${req.body.name}"`
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.body
			await updateBrand(id, req.body.name)
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return res.status(400).send({
					message: `Ya existe una marca con el nombre "${req.body.name}"`
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	delete: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			await deleteBrand(id)
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof ForeignKeyConstraintError) {
				return res.status(400).send({
					message: 'Esta marca no puede ser eliminada ya que está en uso'
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	getAll: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const brands = await listAllBrands(businessId)
		res.status(200).send(brands)
	},
	getOne: async (req: Request, res: Response) => {
		const { id } = req.params
		const brand = await getOneBrand(id)
		res.status(200).send(brand)
	}
}
