import { Request, Response } from 'express'

import { BusinessType } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		BusinessType.findAll()
			.then((types) => res.status(200).send(types))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		BusinessType.findOne({ where: { id } })
			.then((type) => res.status(200).send(type))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
