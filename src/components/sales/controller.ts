import { Request, Response } from 'express';

import { Sale, SaleStatus } from './model';

export default {
	create: (req: Request, res: Response) => {
		Sale.create(req.body)
			.then(() => res.sendStatus(201))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Sale.update(req.body, { where: { id }})
			.then(() => res.sendStatus(200))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params;

		Sale.destroy({ where: { id } })
			.then(() => res.sendStatus(200))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		Sale.findAll()
			.then(Sale => res.status(200).send(Sale))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params;

		Sale.findOne({ where: { id } })
			.then(Sale => res.status(200).send(Sale))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	statusList: (req: Request, res: Response) => {
		SaleStatus.findAll()
			.then(status => res.status(200).send(status))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	}
}
