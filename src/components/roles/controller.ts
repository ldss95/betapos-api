import { Request, Response } from 'express'
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize'

import { Role } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		Role.findAll()
			.then(roles => res.status(200).send(roles))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Role.findOne({ where: { id } })
			.then(role => {
				if (role)
					return res.status(200).send(role)
				
				res.status(404).send({
					message: 'Rol no encontrado'
				})
			}).catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	create: (req: Request, res: Response) => {
		Role.create(req.body)
			.then(role => res.status(201).send({ id: role.id }))
			.catch(error => {
				if (error instanceof UniqueConstraintError) {
					return res.status(400).send({
						message: `Ya existe un rol con el nombre "${req.body.name}"`
					})
				}
				
				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Role.update(req.body, { where: { id } })
			.then(([updated]) => {
				if(updated)
					return res.sendStatus(204)
				
				res.status(404).send({ message: 'Rol no encontrado' })
			}).catch(error => {
				if (error instanceof UniqueConstraintError) {
					return res.status(400).send({
						message: `Ya existe un rol con el nombre "${req.body.name}"`
					})
				}
				
				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params

		Role.destroy({ where: { id } })
			.then(deleted => {
				if(deleted)
					return res.sendStatus(204)
				
				res.status(404).send({ message: 'Role no encontrado' })
			}).catch(error => {
				if (error instanceof ForeignKeyConstraintError) {
					res.status(400).send({
						message: 'No se puede eliminar un rol con usuarios asignados.'
					})
					return;
				}

				res.sendStatus(500)
				throw error
			})
	}
}