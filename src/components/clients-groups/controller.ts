import { Request, Response } from 'express'

import { getAllClientsGroups, getDebtByClientsGroup } from './services'

export default {
	getAll: async (req: Request, res: Response) => {
		try {
			const groups = await getAllClientsGroups(req.session!.businessId)
			res.status(200).send(groups)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getDebtByGroup: async (req: Request, res: Response) => {
		try {
			const { groupId } = req.params
			const debt = await getDebtByClientsGroup(groupId)
			res.status(200).send({ debt })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
