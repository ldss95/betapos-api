import { NextFunction, Request, Response } from 'express'

import { SalePaymentType } from './model'

export default {
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const types = await SalePaymentType.findAll()
			res.status(200).send(types)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getOne: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			const type = await SalePaymentType.findOne({ where: { id } })
			res.status(200).send(type)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
