import { Request, Response } from 'express'

import { InventoryAdjustment } from './model'

export default {
	create: (req: Request, res: Response) => {
		const { userId } = req.session!
		InventoryAdjustment.create({ ...req.body, userId })
			.then(() => res.sendStatus(201))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}