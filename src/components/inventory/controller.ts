import { Request, Response } from 'express'

import {
	addProductCount2Inventory,
	finishInventory,
	getAllInventory,
	getInventoryById,
	modifyProductCountOnInventory,
	startNewInventoryCount
} from './services'

export default {
	getAll: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const data = await getAllInventory(businessId)
		res.status(200).send(data)
	},
	getOne: async (req: Request, res: Response) => {
		const { id } = req.params
		const data = await getInventoryById(id)
		res.status(200).send(data)
	},
	startInventory: async (req: Request, res: Response) => {
		const { businessId, userId } = req.session!
		await startNewInventoryCount(businessId, userId)
		res.sendStatus(201)
	},
	addProductCount2Inventory: async (req: Request, res: Response) => {
		const { userId } = req.session!
		const { inventoryId, productId, quantity } = req.body
		addProductCount2Inventory({ userId, inventoryId, quantity, productId })
		res.sendStatus(204)
	},
	modifyProductCount: async (req: Request, res: Response) => {
		const { id, quantity } = req.body
		await modifyProductCountOnInventory(id, quantity)
		res.sendStatus(204)
	},
	finish: async (req: Request, res: Response) => {
		const { id } = req.params
		await finishInventory(id)
		res.sendStatus(204)
	}
}
