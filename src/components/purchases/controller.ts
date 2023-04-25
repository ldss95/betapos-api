import { NextFunction, Request, Response } from 'express'
import { CustomError } from '../../errors'

import { addProductToPurchase, createPurchase, deletePurchase, deletePurchaseFile, getAllPurchases, getOnePurchase, markPurchaseAsPayed, removePurchaseProduct, saveUploadedPurchaseFile, updatePurchase, updatePurchaseProductCost, updatePurchaseProductPrice, updatePurchaseProductQty } from './services'

export default {
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId } = req.session!
			const purchases = await getAllPurchases(businessId)
			res.status(200).send(purchases)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getOne: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			const purchase = await getOnePurchase(id)
			res.status(200).send(purchase)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId, userId } = req.session!
			const id = await createPurchase(req.body, businessId, userId)
			res.status(201).send({ id })
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId } = req.session!
			await updatePurchase(req.body, businessId)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	attachFile: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			const file = req.file as Express.MulterS3.File
			await saveUploadedPurchaseFile(id, file.location)

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	removeAttachedFile: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			await deletePurchaseFile(id)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	markAsPayed: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			await markPurchaseAsPayed(id)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	delete: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			await deletePurchase(id)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	addProduct: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { purchaseId, productId } = req.body
			await addProductToPurchase(purchaseId, productId)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	updateProductQty: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id, quantity } = req.body
			await updatePurchaseProductQty(id, quantity)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	updateProductCost: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id, cost } = req.body
			const { merchantId, userId } = req.session!
			const ip = req.socket.remoteAddress
			const agent = req.headers['user-agent']
			await updatePurchaseProductCost(merchantId, id, cost, {
				userId,
				ip,
				agent
			})
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(400).send({
					message: error.message
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	updateProductPrice: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id, price } = req.body
			const { merchantId, userId } = req.session!
			const ip = req.socket.remoteAddress
			const agent = req.headers['user-agent']
			await updatePurchaseProductPrice(merchantId, id, price, {
				userId,
				agent,
				ip
			})
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(400).send({
					message: error.message
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	removeProduct: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			removePurchaseProduct(id)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
