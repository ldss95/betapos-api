import { Request, Response } from 'express'

import { SalePaymentType } from './model'

export default {
	getAll: async (req: Request, res: Response) => {
		const types = await SalePaymentType.findAll()
		res.status(200).send(types)
	},
	getOne: async (req: Request, res: Response) => {
		const { id } = req.params
		const type = await SalePaymentType.findOne({ where: { id } })
		res.status(200).send(type)
	}
}
