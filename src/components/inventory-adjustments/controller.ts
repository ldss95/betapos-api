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
				const [{ stock }] = await db.query<{ stock: number }>(
					`
					SELECT
						ROUND(
							(
								p.initialStock -
								COALESCE((
									SELECT
										SUM(sp.quantity)
									FROM
										sales_products sp
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
										p.affectsExistence = 1
								), 0) +
								COALESCE((
									SELECT
										SUM(quantity)
									FROM
										inventory_adjustments
									WHERE
										productId = p.id
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

				if (diference === 0 || quantity === stock) {
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

			const data = req.body
			if (data.type === 'OUT' && data.quantity > 0) {
				data.quantity = data.quantity * -1
			}

			await InventoryAdjustment.create({ ...data, userId })
			res.sendStatus(201)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
