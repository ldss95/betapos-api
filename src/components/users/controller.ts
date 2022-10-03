import { Request, Response } from 'express'
import { format } from '@ldss95/helpers'
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError, Op } from 'sequelize'
import bcrypt from 'bcrypt'

import { User } from './model'
import { Role } from '../roles/model'
import { deleteFile, notifyUpdate } from '../../helpers'
import { Business } from '../business/model'
import { deleteUser, getAllUsers, getOneUser, getUsersList } from './services'
import { CustomError } from '../../errors'

export default {
	getOne: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const user = await getOneUser(id)
			res.status(200).send(user)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getAll: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			const users = await getAllUsers(businessId)
			res.status(200).send(users)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getList: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			const users = await getUsersList(businessId)
			res.status(200).send(users)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const { id } = req.body
			const session = req.session!

			const [updated] = await User.update(req.body, { where: { id } })
			if (!updated) {
				return res.status(404).send({ message: 'Usuario no encontrado' })
			}

			notifyUpdate('users', session?.merchantId)
			res.sendStatus(204)
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
			const { force } = req.body
			const session = req.session!
			await deleteUser(id, force, session?.merchantId)

			res.sendStatus(204)
		} catch (error) {
			if (error instanceof ForeignKeyConstraintError) {
				res.status(400).send({
					message:
						'No se puede eliminar un usuario despues de haber realizado transacciones, se recomienda desactivar.'
				})
				return
			}

			if (error instanceof CustomError) {
				res.status(400).send({
					message: 'No se puede eliminar este usuario.'
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
			const role = await Role.findByPk(user.roleId)
			const session = req.session!

			if (role?.code == 'PARTNER') {
				user.partnerCode = await getPartnerCode()
			}

			const password = await bcrypt.hashSync(user.password, 13)
			const businessId = session?.businessId

			const { id } = await User.create({
				...user,
				password,
				businessId
			})

			notifyUpdate('users', session?.merchantId)
			res.status(201).send({ id })
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				const { fields } = error
				const { email, dui, nickName } = user

				if (fields['users.email']) {
					return res.status(400).send({
						message: `El email '${email}' ya está en uso.`
					})
				}

				if (fields['users.dui']) {
					return res.status(400).send({
						message: `La cédula '${format.dui(dui)}' ya está en uso.`
					})
				}

				if (fields['users.nickName']) {
					return res.status(400).send({
						message: `El nombre de usuario '${nickName}' ya está en uso.`
					})
				}
			}

			if (error instanceof ValidationError) {
				const { message } = error.errors[0]
				return res.status(400).send({ message })
			}

			res.status(500).send(error)
			throw error
		}
	},
	setProfileImage: async (req: Request, res: Response) => {
		try {
			let { location } = req.file as Express.MulterS3.File
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
	addPhoto: async (req: Request, res: Response) => {
		try {
			let { location } = req.file as Express.MulterS3.File
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
				include: {
					model: Role,
					as: 'role'
				}
			})
			const updated = await User.findAll({
				where: {
					...(date != 'ALL' && {
						updatedAt: { [Op.gte]: date }
					}),
					businessId: business.id
				},
				include: {
					model: Role,
					as: 'role'
				}
			})

			res.status(200).send({
				created: created.map((user) => ({
					...user.toJSON(),
					role: user.role.code == 'BIOWNER' ? 'ADMIN' : 'SELLER'
				})),
				updated: updated.map((user) => ({
					...user.toJSON(),
					role: user.role.code == 'BIOWNER' ? 'ADMIN' : 'SELLER'
				}))
			})
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}

// Asigna un codigo unico de 4 digitos
async function getPartnerCode(): Promise<string> {
	const MAX = 9999
	const MIN = 1
	const DIF = MAX - MIN
	const random = Math.random()
	const intCode = (Math.floor(random * DIF) + MIN).toString()
	const code = intCode.length == 4 ? intCode : intCode.padStart(4, intCode)

	const user = await User.findOne({
		where: {
			partnerCode: code
		}
	})

	if (user) {
		return await getPartnerCode()
	}

	return code
}
