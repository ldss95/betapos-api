import { Request, Response } from 'express'
import { getAllLeads } from './services'

export default {
	getAll: async (req: Request, res: Response) => {
		const leads = await getAllLeads()
		res.status(200).send(leads)
	}
}
