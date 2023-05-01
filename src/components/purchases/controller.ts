import { Request, Response } from 'express'

import { addProductToPurchase, createPurchase, deletePurchase, deletePurchaseFile, getAllPurchases, getOnePurchase, markPurchaseAsPayed, removePurchaseProduct, saveUploadedPurchaseFile, updatePurchase, updatePurchaseProductCost, updatePurchaseProductPrice, updatePurchaseProductQty } from './services'

export default {
	getAll: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const purchases = await getAllPurchases(businessId)
		res.status(200).send(purchases)
	},
	getOne: async (req: Request, res: Response) => {
		const { id } = req.params
		const purchase = await getOnePurchase(id)
		res.status(200).send(purchase)
	},
	create: async (req: Request, res: Response) => {
		const { businessId, userId } = req.session!
		const id = await createPurchase(req.body, businessId, userId)
		res.status(201).send({ id })
	},
	update: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		await updatePurchase(req.body, businessId)
		res.sendStatus(204)
	},
	attachFile: async (req: Request, res: Response) => {
		const { id } = req.params
		const file = req.file as Express.MulterS3.File
		await saveUploadedPurchaseFile(id, file.location)

		res.sendStatus(204)
	},
	removeAttachedFile: async (req: Request, res: Response) => {
		const { id } = req.params
		await deletePurchaseFile(id)
		res.sendStatus(204)
	},
	markAsPayed: async (req: Request, res: Response) => {
		const { id } = req.params
		await markPurchaseAsPayed(id)
		res.sendStatus(204)
	},
	delete: async (req: Request, res: Response) => {
		const { id } = req.params
		await deletePurchase(id)
		res.sendStatus(204)
	},
	addProduct: async (req: Request, res: Response) => {
		const { purchaseId, productId } = req.body
		await addProductToPurchase(purchaseId, productId)
		res.sendStatus(204)
	},
	updateProductQty: async (req: Request, res: Response) => {
		const { id, quantity } = req.body
		await updatePurchaseProductQty(id, quantity)
		res.sendStatus(204)
	},
	updateProductCost: async (req: Request, res: Response) => {
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
	},
	updateProductPrice: async (req: Request, res: Response) => {
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
	},
	removeProduct: async (req: Request, res: Response) => {
		const { id } = req.params
		removePurchaseProduct(id)
		res.sendStatus(204)
	}
}
