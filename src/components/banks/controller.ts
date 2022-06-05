import { Request, Response } from 'express'

import { Bank } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		Bank.findAll({
			order: [['name', 'ASC']],
			raw: true
		})
			.then((banks) => res.status(200).send(banks))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
