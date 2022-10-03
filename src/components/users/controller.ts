import { Request, Response } from 'express'
import { Op } from 'sequelize'

import { User } from './model'
import { Role } from '../roles/model'
import { deleteFile } from '../../helpers'
import { Business } from '../business/model'
import { createUser, deleteUser, getAllUsers, getOneUser, getUsersList, updateUser } from './services'
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
			const { merchantId } = req.session!
			await updateUser(req.body, merchantId)
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(400).send({
					message: error.message
				})
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
			if (error instanceof CustomError) {
				return res.status(400).send(error.message)
			}

			res.sendStatus(500)
			throw error
		}
	},
	create: async (req: Request, res: Response) => {
		try {
			const { merchantId, businessId } = req.session!
			const id = await createUser(req.body, businessId, merchantId)
			res.status(201).send({ id })
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(400).send({
					message: error.message
				})
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
