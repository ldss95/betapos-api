import { NextFunction, Request, Response } from 'express'

import { Role } from './model'

export default {
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const roles = await Role.findAll()
			res.status(200).send(roles)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
