import { Request, Response } from 'express'

import { createPurchase, getAllPurchases, getOnePurchase, updatePurchase } from './services'

export default {
	getAll: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			const purchases = await getAllPurchases(businessId)
			res.status(200).send(purchases)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getOne: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const purchase = await getOnePurchase(id)
			res.status(200).send(purchase)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	create: async (req: Request, res: Response) => {
		try {
			const { businessId, userId } = req.session!
			const id = await createPurchase(req.body, businessId, userId)
			res.status(201).send({ id })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			await updatePurchase(req.body, businessId)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
