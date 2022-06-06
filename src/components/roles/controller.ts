import { Request, Response } from 'express'

import { Role } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		Role.findAll()
			.then((roles) => res.status(200).send(roles))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
