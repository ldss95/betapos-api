import { Request, Response } from 'express'

import { getAllClientsGroups } from './services'

export default {
	getAll: async (req: Request, res: Response) => {
		try {
			const groups = await getAllClientsGroups(req.session!.businessId)
			res.status(200).send(groups)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
