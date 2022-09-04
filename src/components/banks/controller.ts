import { Request, Response } from 'express'

import { getAllBanks } from './services'

export default {
	getAll: async (req: Request, res: Response) => {
		try {
			const banks = await getAllBanks()
			res.status(200).send(banks)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
