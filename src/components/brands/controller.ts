import { Request, Response } from 'express'
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize'

import { createBrand, deleteBrand, getOneBrand, listAllBrands, updateBrand } from './services'

export default {
	create: async (req: Request, res: Response) => {
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
			throw error
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const { id } = req.body
			await updateBrand(id, req.body.name)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return res.status(400).send({
					message: `Ya existe una marca con el nombre "${req.body.name}"`
				})
			}

			res.sendStatus(500)
			throw error
		}
	},
	delete: async (req: Request, res: Response) => {
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
			throw error
		}
	},
	getAll: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			const brands = await listAllBrands(businessId)
			res.status(200).send(brands)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getOne: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const brand = await getOneBrand(id)
			res.status(200).send(brand)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
