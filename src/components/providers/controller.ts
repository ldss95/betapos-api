import { NextFunction, Request, Response } from 'express'
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize'

import { Provider } from './model'
import { Bank } from '../banks/model'

export default {
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId } = req.session!
			await Provider.create({ ...req.body, businessId })
			res.sendStatus(201)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				const { fields } = error

				const { name, email, bankAccount } = req.body

				let message = ''
				if (fields['providers_business_id_name']) {
					message = `Ya tienes un proveedor llamado '${name}'.`
				} else if (fields['providers_business_id_email']) {
					message = `Ya tienes un proveedor con el email '${email}'.`
				} else if (fields['providers_business_id_bank_account']) {
					message = `Ya tienes un proveedor con el numero de cuenta '${bankAccount}'.`
				}

				return res.status(400).send({ message })
			}

			res.sendStatus(500)
			next(error)
		}
	},
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.body
			await Provider.update(req.body, { where: { id } })
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				const { fields } = error

				const { name, email, bankAccount } = req.body

				let message = ''
				if (fields['providers.name']) {
					message = `Ya tienes un proveedor llamado '${name}'.`
				} else if (fields['providers.email']) {
					message = `Ya tienes un proveedor con el email '${email}'.`
				} else if (fields['providers.bankAccount']) {
					message = `Ya tienes un proveedor con el numero de cuenta '${bankAccount}'.`
				}

				return res.status(400).send({ message })
			}

			res.sendStatus(500)
			next(error)
		}
	},
	delete: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			await Provider.destroy({ where: { id } })
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
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
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
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
