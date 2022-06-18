import { Request, Response } from 'express'
import { QueryTypes } from 'sequelize'
import { db } from '../../database/connection'

import { InventoryAdjustment } from './model'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { userId } = req.session!
			const { type, productId, quantity, description } = req.body

			if (type == 'X') {
				const [{ stock }] = await db.query(
					`
					SELECT
						ROUND(
							(
								p.initialStock -
								COALESCE((
									SELECT
										SUM(sp.quantity)
									FROM
										sale_products sp
									JOIN
										sales s ON s.id = sp.saleId
									WHERE
										sp.productId = p.id AND
										s.status = 'DONE'
								), 0) +
								COALESCE((
									SELECT
										SUM(pp.quantity)
									FROM
										purchase_products pp
									JOIN
										purchases p ON p.id = pp.purchaseId
									WHERE
										pp.productId = p.id AND
										p.status = 'DONE' AND
										p.affectsExistence = 1
								), 0) +
								COALESCE((
									SELECT
										SUM(quantity)
									FROM
										inventory_adjustments
									WHERE
										productId = p.id AND
										type = 'IN'
								), 0) -
								COALESCE((
									SELECT
										SUM(quantity)
									FROM
										inventory_adjustments
									WHERE
										productId = p.id AND
										type = 'OUT'
								), 0)
							),
							2
						) AS stock
					FROM
						products p
					WHERE
						id = ?
				`,
					{ replacements: [productId], type: QueryTypes.SELECT, raw: true }
				)

				const diference = quantity - stock

				if (diference == 0) {
					return res.sendStatus(204)
				}

				await InventoryAdjustment.create({
					productId,
					type: diference > 0 ? 'IN' : 'OUT',
					quantity: diference,
					description,
					userId
				})

				return res.sendStatus(201)
			}

			await InventoryAdjustment.create({ ...req.body, userId })
			res.sendStatus(201)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
