import { Request, Response } from 'express'
import { getAllLeads } from './services'

export default {
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
