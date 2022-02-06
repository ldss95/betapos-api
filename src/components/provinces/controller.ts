import { Request, Response } from 'express'

import { Province } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		Province.findAll()
			.then((provinces) => res.status(200).send(provinces))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
