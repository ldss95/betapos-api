import { Request, Response } from 'express'
import { Op } from 'sequelize'

import { InventoryAdjustment } from './model'
import { createInventoryAdjustment } from './services'
import moment from 'moment'

export default {
	create: async (req: Request, res: Response) => {
		const { userId } = req.session!
		const { productId, quantity, description } = req.body

		const todayR = await InventoryAdjustment.count({
			where: {
				[Op.and]: [
					{ productId },
					{
						createdAt: {
							[Op.gt]: moment().format('YYYY-MM-DD 00:00:00')
						}
					}
				]
			}
		})

		if (todayR === 0) {
			await createInventoryAdjustment({
				type: 'X',
				productId,
				quantity: 0,
				userId,
				description
			})
		}

		await createInventoryAdjustment({
			userId,
			type: 'IN',
			productId,
			quantity,
			description
		})

		res.sendStatus(201)
	}
}
