import { Request, Response } from 'express'
import { format } from '@ldss95/helpers'
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError, Op } from 'sequelize'
import firebase from 'firebase-admin'
import moment from 'moment'
import bcrypt from 'bcrypt'

import { User } from './model'
import { Role } from '../roles/model'
import { deleteFile } from '../../helpers'
import { db } from '../../database/firebase'
import { Business } from '../business/model'

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
			attributes: {
				exclude: ['password']
			},
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
	getList: (req: Request, res: Response) => {
		User.findAll({
			attributes: ['id', 'firstName', 'lastName'],
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
	update: async (req: Request, res: Response) => {
		try {
			const { id } = req.body

			const [updated] = await User.update(req.body, { where: { id } })
			if (updated) {
				return res.sendStatus(204)
			}

			const { merchantId } = req.session!
			if (merchantId) {
				await db
					.collection(merchantId)
					.doc('users')
					.update({
						lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
					})
			}

			res.status(404).send({ message: 'Usuario no encontrado' })
		} catch (error) {
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
		}
	},
	delete: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const deleted = await User.destroy({ where: { id } })
			if (!deleted) {
				return res.status(404).send({ message: 'Usuario no encontrado' })
			}

			const { merchantId } = req.session!
			if (merchantId) {
				await db
					.collection(merchantId)
					.doc('users')
					.update({
						deleted: firebase.firestore.FieldValue.arrayUnion(id)
					})
			}
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof ForeignKeyConstraintError) {
				res.status(400).send({
					message:
						'No se puede eliminar un usuario despues de haber realizado transacciones, se recomienda desactivar.'
				})
				return
			}

			res.sendStatus(500)
			throw error
		}
	},
	create: async (req: Request, res: Response) => {
		const user = req.body
		try {
			const password = await bcrypt.hashSync(user.password, 13)
			const { id } = await User.create({
				...req.body,
				password,
				...(req.session!.businessId && {
					businessId: req.session!.businessId
				})
			})

			const { merchantId } = req.session!
			if (merchantId) {
				await db
					.collection(merchantId)
					.doc('users')
					.update({
						lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
					})
			}
			res.status(201).send({ id })
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				const { fields } = error
				const { email, dui, nickName } = user

				let message = ''
				if (fields['users.email']) {
					message = `El email '${email}' ya está en uso.`
				} else if (fields['users.dui']) {
					message = `La cedula '${format.dui(dui)}' ya está en uso.`
				} else if (fields['users.nickName']) {
					message = `El nombre de usuario '${nickName}' ya está en uso.`
				}

				return res.status(400).send({ message })
			}

			if (error instanceof ValidationError) {
				const { message } = error.errors[0]
				return res.status(400).send({ message })
			}

			res.status(500).send(error)
			throw error
		}
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
	},
	addPhoto: async (req: any, res: Response) => {
		try {
			const { file } = req
			let { location } = file
			if (location.substr(0, 8) != 'https://') {
				location = `https://${location}`
			}

			const { id } = req.body

			const user = await User.findOne({ where: { id } })

			// Delte current photo if exists
			if (user?.photoUrl && user.photoUrl != location) {
				let key = user.photoUrl.split('/images/').pop()
				key = 'images/' + key
				deleteFile(key)
			}

			await user!.update({ photoUrl: location })
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getUpdates: async (req: Request, res: Response) => {
		try {
			const { date } = req.params
			const merchantId = req.header('merchantId')

			const business = await Business.findOne({
				where: {
					merchantId
				}
			})

			if (!business || !business.isActive) {
				return res.sendStatus(400)
			}

			const created = await User.findAll({
				where: {
					...(date != 'ALL' && {
						createdAt: { [Op.gte]: date }
					}),
					businessId: business.id
				},
				raw: true
			})
			const updated = await User.findAll({
				where: {
					...(date != 'ALL' && {
						updatedAt: { [Op.gte]: date }
					}),
					businessId: business.id
				},
				raw: true
			})

			res.status(200).send({ created, updated })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
