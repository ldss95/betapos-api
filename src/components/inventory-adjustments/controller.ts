import { Request, Response } from 'express'

import { createInventoryAdjustment } from './services'

export default {
	create: async (req: Request, res: Response) => {
		const { userId } = req.session!
		const { productId, quantity, description, type } = req.body

		await createInventoryAdjustment({
			userId,
			type,
			productId,
			quantity,
			description
		})

		res.sendStatus(201)
	}
}
