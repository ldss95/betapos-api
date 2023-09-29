import { NextFunction, Request, Response } from 'express'
import { ForeignKeyConstraintError } from 'sequelize'

import { Provider } from './model'
import { Bank } from '../banks/model'
import { isValidRNC } from '../../utils/helpers'



export default {
	create: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const { rnc } = req.body
		await Provider.create({
			...req.body,
			rnc: isValidRNC(rnc) ? rnc : null,
			businessId
		})
		res.sendStatus(201)
	},
	update: async (req: Request, res: Response) => {
		const { id, rnc } = req.body
		const provider = await Provider.findByPk(id)
		provider && await provider.update({
			...req.body,
			rnc: isValidRNC(rnc) ? rnc : null
		})
		res.sendStatus(204)

	},
	delete: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			const provider = await Provider.findByPk(id)
			provider && await provider.destroy()
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof ForeignKeyConstraintError) {
				return res.status(400).send({
					message:
						'No se puede eliminar el proveedor porque tiene registros asociados, se recomienda desactivar.'
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	getAll: async (req: Request, res: Response) => {
		const providers = await Provider.findAll({
			order: [['name', 'ASC']],
			include: {
				model: Bank,
				as: 'bank'
			},
			where: {
				businessId: req.session!.businessId
			}
		})

		res.status(200).send(providers.map((provider) => provider.toJSON()))
	}
}
