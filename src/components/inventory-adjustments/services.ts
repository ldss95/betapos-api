import { QueryTypes } from 'sequelize'

import { db } from '../../database/connection'
import { handleStockChanges } from '../stocks/services'
import { StockProps, StockTransactionTypeId } from '../stocks/interface'

interface InventoryAdjustmentParams {
	type: 'X' | 'IN' | 'OUT';
	productId: string;
	quantity: number;
	description: string;
	userId: string;
}

export async function createInventoryAdjustment({ type, productId, quantity, description, userId }: InventoryAdjustmentParams) {
	if (type == 'X') {
		const [{ stock }] = await db.query<StockProps>(
			`SELECT
				*
			FROM
				stocks s
			WHERE
				s.createdAt = (
					SELECT
						MAX(createdAt)
					FROM
						stocks
					WHERE
						productId = s.productId
					LIMIT 1
				) AND
				s.productId = ?
			GROUP BY s.productId;`,
			{
				replacements: [productId],
				type: QueryTypes.SELECT
			}
		)

		const difference = quantity - stock

		if (difference === 0 || quantity === stock) {
			return
		}

		await handleStockChanges({
			transactionTypeId: StockTransactionTypeId.INVENTORY_ADJUSTMENT,
			type: difference > 0 ? 'IN' : 'OUT',
			products: [{
				productId,
				quantity: difference * -1 // Porque la funcion handleStockChanges ya hace una conversion a negativo cuando el tipo es OUT
			}]
		})

		return
	}

	await handleStockChanges({
		transactionTypeId: StockTransactionTypeId.INVENTORY_ADJUSTMENT,
		type,
		products: [{ productId, quantity }]
	})
}
