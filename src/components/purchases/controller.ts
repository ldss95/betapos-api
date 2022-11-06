import { Request, Response } from 'express'
import { CustomError } from '../../errors'

import { addProductToPurchase, createPurchase, deletePurchase, deletePurchaseFile, getAllPurchases, getOnePurchase, markPurchaseAsPayed, removePurchaseProduct, saveUploadedPurchaseFile, updatePurchase, updatePurchaseProductCost, updatePurchaseProductPrice, updatePurchaseProductQty } from './services'

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
	},
	attachFile: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const file = req.file as Express.MulterS3.File
			await saveUploadedPurchaseFile(id, file.location)

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	removeAttachedFile: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			await deletePurchaseFile(id)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	markAsPayed: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			await markPurchaseAsPayed(id)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	delete: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			await deletePurchase(id)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	addProduct: async (req: Request, res: Response) => {
		try {
			const { purchaseId, productId } = req.body
			await addProductToPurchase(purchaseId, productId)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	updateProductQty: async (req: Request, res: Response) => {
		try {
			const { id, quantity } = req.body
			await updatePurchaseProductQty(id, quantity)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	updateProductCost: async (req: Request, res: Response) => {
		try {
			const { id, cost } = req.body
			const { merchantId } = req.session!
			await updatePurchaseProductCost(merchantId, id, cost)
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(400).send({
					message: error.message
				})
			}

			res.sendStatus(500)
			throw error
		}
	},
	updateProductPrice: async (req: Request, res: Response) => {
		try {
			const { id, price } = req.body
			const { merchantId } = req.session!
			await updatePurchaseProductPrice(merchantId, id, price)
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(400).send({
					message: error.message
				})
			}

			res.sendStatus(500)
			throw error
		}
	},
	removeProduct: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			removePurchaseProduct(id)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
