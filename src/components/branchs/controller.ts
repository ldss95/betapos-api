import { Request, Response } from 'express';

import { Branch } from './model';

export default {
	create: (req: Request, res: Response) => {
		const branch = {
			...req.body,
			businessId: req.session!.branchId
		}

		Branch.create(branch)
			.then(() => res.sendStatus(201))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Branch.update(req.body, { where: { id }})
			.then(() => res.sendStatus(200))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params;

		Branch.destroy({ where: { id } })
			.then(() => res.sendStatus(200))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		const { branchId } = req.session!
		
		Branch.findAll({ where: { branchId }})
			.then(branchs => res.status(200).send(branchs))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params;

		Branch.findOne({ where: { id } })
			.then(branch => res.status(200).send(branch))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
}
