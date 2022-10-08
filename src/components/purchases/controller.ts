import { Request, Response } from 'express'

import { createPurchase, fetchAllPurchases } from './services'

export default {
	getAll: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			const purchases = await fetchAllPurchases(businessId)
			res.status(200).send(purchases)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	create: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			const id = await createPurchase(req.body, businessId)
			res.status(201).send({ id })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
