import { Request, Response } from 'express'

import { Province } from './model'

export default {
	getAll: async (req: Request, res: Response) => {
		const provinces = await Province.findAll()
		res.status(200).send(provinces)
	}
}
