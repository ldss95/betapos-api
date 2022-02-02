import { Request, Response } from 'express'

import { Client } from './model'

export default {
	create: (req: Request, res: Response) => {
		Client.create({ ...req.body, businessId: req.session!.businessId })
			.then(() => res.sendStatus(201))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Client.update(req.body, { where: { id } })
			.then(() => res.sendStatus(204))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params

		Client.destroy({ where: { id } })
			.then(() => res.sendStatus(204))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		Client.findAll({ where: { businessId: req.session!.businessId } })
			.then((clients) => res.status(200).send(clients))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Client.findOne({ where: { id } })
			.then((model) => res.status(200).send(model))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
