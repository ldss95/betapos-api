import { Request, Response } from 'express'

import { Role } from './model'

export default {
	getAll: async (req: Request, res: Response) => {
		const roles = await Role.findAll()
		res.status(200).send(roles)
	}
}
