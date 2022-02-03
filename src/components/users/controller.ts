import { Request, Response } from 'express'
import { format } from '@ldss95/helpers'
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize'

import { User } from './model'
import { Role } from '../roles/model'
import { deleteFile } from '../../helpers'

export default {
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		User.findOne({
			where: { id },
			attributes: [
				'id',
				'firstName',
				'lastName',
				'birthDate',
				'email',
				'dui',
				'address',
				'photoUrl',
				'roleId',
				'businessId',
				'isActive',
				'createdAt',
				'updatedAt'
			]
		})
			.then((user) => {
				if (user) return res.status(200).send(user)

				res.status(404).send({
					message: 'Usuario no encontrado'
				})
			})
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		User.findAll({
			include: {
				model: Role,
				as: 'role'
			},
			where: {
				businessId: req.session!.businessId
			}
		})
			.then((users) => res.status(200).send(users))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		User.update(req.body, { where: { id } })
			.then(([updated]) => {
				if (updated) return res.sendStatus(204)

				res.status(404).send({ message: 'Usuario no encontrado' })
			})
			.catch((error) => {
				if (error instanceof UniqueConstraintError) {
					const { fields } = error
					const { email, dui } = req.body

					let message = ''
					if (fields['users.email']) message = `El email '${email}' ya está en uso.`
					else if (fields['users.dui']) message = `La cedula '${format.dui(dui)}' ya está en uso.`

					return res.status(400).send({ message })
				}

				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params
		User.destroy({ where: { id } })
			.then((deleted) => {
				if (deleted) return res.sendStatus(204)

				res.status(404).send({ message: 'Usuario no encontrado' })
			})
			.catch((error) => {
				if (error instanceof ForeignKeyConstraintError) {
					res.status(400).send({
						message:
							'No se puede eliminar un usuario despues de haber realizado transacciones, se recomienda desactivar.'
					})
					return
				}

				res.sendStatus(500)
				throw error
			})
	},
	create: (req: Request, res: Response) => {
		const user = req.body

		User.create({ ...req.body, businessId: req.session!.businessId })
			.then(({ id }) => res.status(201).send({ id }))
			.catch((error) => {
				if (error instanceof UniqueConstraintError) {
					const { fields } = error
					const { email, dui } = user

					let message = ''
					if (fields['users.email']) message = `El email '${email}' ya está en uso.`
					else if (fields['users.dui']) message = `La cedula '${format.dui(dui)}' ya está en uso.`

					return res.status(400).send({ message })
				}

				if (error instanceof ValidationError) {
					const { message } = error.errors[0]
					return res.status(400).send({ message })
				}

				res.status(500).send(error)
				throw error
			})
	},
	setProfileImage: async (req: any, res: Response) => {
		try {
			const { file } = req
			let { location } = file
			if (location.substr(0, 8) != 'https://') {
				location = `https://${location}`
			}

			const id = req.session!.userId
			const user = await User.findOne({ where: { id } })

			// Delte current photo if exists
			if (user?.photoUrl && user.photoUrl != location) {
				let key = user.photoUrl.split('/images/').pop()
				key = 'images/' + key
				deleteFile(key)
			}

			user!.update({ photoUrl: location })
			res.status(200).send({ photoUrl: location })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
