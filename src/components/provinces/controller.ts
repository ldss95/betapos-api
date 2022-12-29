import { NextFunction, Request, Response } from 'express'

import { Province } from './model'

export default {
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const provinces = await Province.findAll()
			res.status(200).send(provinces)
		} catch(error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
