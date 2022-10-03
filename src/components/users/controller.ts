import { Request, Response } from 'express'

import { createUser, deleteUser, getAllUsers, getOneUser, getUsersList, getUsersUpdates, setUserImage, updateUser } from './services'
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
			const { userId } = req.session!
			const  { location } = req.file as Express.MulterS3.File
			await setUserImage(userId, location)
			res.status(200).send({ photoUrl: location })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	addPhoto: async (req: Request, res: Response) => {
		try {
			const { location } = req.file as Express.MulterS3.File
			const { id } = req.body
			await setUserImage(id, location)

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
			const updates = await getUsersUpdates(date, merchantId!)


			res.status(200).send({
				created: updates.created.map((user) => ({
					...user,
					role: user.role.code == 'BIOWNER' ? 'ADMIN' : 'SELLER'
				})),
				updated: updates.updated.map((user) => ({
					...user,
					role: user.role.code == 'BIOWNER' ? 'ADMIN' : 'SELLER'
				}))
			})
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(400).send({
					message: error.message
				})
			}

			res.sendStatus(500)
			throw error
		}
	}
}
