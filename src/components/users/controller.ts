import { Request, Response } from 'express'

import {
	createUser,
	deleteUser,
	getAllUsers,
	getOneUser,
	getUsersList,
	getUsersUpdates,
	setUserImage,
	updateUser
} from './services'

export default {
	getOne: async (req: Request, res: Response) => {
		const { id } = req.params
		const user = await getOneUser(id)
		res.status(200).send(user)
	},
	getAll: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const users = await getAllUsers(businessId)
		res.status(200).send(users)
	},
	getList: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const users = await getUsersList(businessId)
		res.status(200).send(users)
	},
	update: async (req: Request, res: Response) => {
		const { merchantId } = req.session!
		await updateUser(req.body, merchantId)
		res.sendStatus(204)
	},
	delete: async (req: Request, res: Response) => {
		const { id } = req.params
		const { force } = req.body
		const session = req.session!
		await deleteUser(id, force, session?.merchantId)

		res.sendStatus(204)
	},
	create: async (req: Request, res: Response) => {
		const { merchantId, businessId } = req.session!
		const id = await createUser(req.body, businessId, merchantId)
		res.status(201).send({ id })
	},
	setProfileImage: async (req: Request, res: Response) => {
		const { userId } = req.session!
		const  { location } = req.file as Express.MulterS3.File
		await setUserImage(userId, location)
		res.status(200).send({ photoUrl: location })
	},
	addPhoto: async (req: Request, res: Response) => {
		const { location } = req.file as Express.MulterS3.File
		const { id } = req.body
		await setUserImage(id, location)

		res.sendStatus(204)
	},
	getUpdates: async (req: Request, res: Response) => {
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
	}
}
