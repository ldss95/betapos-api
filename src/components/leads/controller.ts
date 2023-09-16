import { Request, Response } from 'express'
import { createNewLead, getAllLeads } from './services'

export default {
	create: async (req: Request, res: Response) => {
		const { userId } = req.session!
		await createNewLead({ ...req.body, userId })
		res.sendStatus(201)
	},
	getAll: async (req: Request, res: Response) => {
		const leads = await getAllLeads()
		res.status(200).send(leads)
	},
	getAllUserLeads: async (req: Request, res: Response) => {
		const userId = req.session!.userId
		const leads = await getAllLeads(userId)
		res.status(200).send(leads)
	},
}
