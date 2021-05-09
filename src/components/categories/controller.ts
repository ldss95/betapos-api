import { Request, Response } from 'express';

import { Category } from './model';

export default {
	create: (req: Request, res: Response) => {
		const category = {
			...req.body,
			businessId: req.session!.businessId
		}

		Category.create(category)
			.then(() => res.sendStatus(201))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Category.update(req.body, { where: { id }})
			.then(() => res.sendStatus(200))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params;

		Category.destroy({ where: { id } })
			.then(() => res.sendStatus(200))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!

		Category.findAll({ where: { businessId}})
			.then(categories => res.status(200).send(categories))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params;

		Category.findOne({ where: { id } })
			.then(category => res.status(200).send(category))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
}
