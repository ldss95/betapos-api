import { Op, QueryTypes } from 'sequelize'

import { db } from '../../database/connection'
import { StockProps, StockTransactionTypeId } from './interface'
import { Stock } from './model'
import { round } from '../../utils/helpers'
import { ProductLink } from '../products/model'

interface HandleStockChangesParams {
	transactionId?: string;
	transactionTypeId: StockTransactionTypeId;
	products: {
		productId: string;
		quantity: number;
	}[];
	type: 'IN' | 'OUT';
}

export async function handleStockChanges({ type, transactionId, transactionTypeId, products }: HandleStockChangesParams) {
	const currentStocks = await db.query<StockProps>(
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
			s.productId IN (?)
		GROUP BY s.productId;`,
		{
			replacements: [
				products.map(({ productId }) => productId)
			],
			type: QueryTypes.SELECT
		}
	)

	await Stock.bulkCreate(
		products.map(({ productId, quantity }) => {
			const qty =  (type === 'IN') ? quantity : quantity * -1
			const currentStock = currentStocks.find((stock) => stock.productId === productId)?.stock || 0
			const stock = round(currentStock + qty)

			return {
				productId,
				quantity: qty,
				stock,
				transactionId,
				transactionTypeId
			}
		})
	)

	// Productos relacionados
	const ids = products.map(({ productId }) => productId)
	const _products = await ProductLink.findAll({
		where: {
			[Op.or]: [
				{
					parentProductId: {
						[Op.in]: ids
					}
				},
				{
					childProductId: {
						[Op.in]: ids
					}
				}
			]
		}
	})

	if (_products.length === 0) {
		return
	}

	function isParent(id: string) {
		return products.map(({ productId }) => productId).includes(id)
	}

	const currentLinkedStocks = await db.query<StockProps>(
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
			s.productId IN (?)
		GROUP BY s.productId;`,
		{
			replacements: [
				_products
					.map(({ parentProductId, childProductId }) => [parentProductId, childProductId])
					.flat()
			],
			type: QueryTypes.SELECT
		}
	)

	await Stock.bulkCreate(
		_products.map(({ parentProductId, childProductId, quantityOnParent }) => {
			if (isParent(parentProductId)) {
				const quantity = products.find((product) => product.productId === parentProductId)?.quantity || 0
				const childQuantity = quantity * quantityOnParent
				const qty =  (type === 'IN') ? childQuantity : childQuantity * -1
				const currentStock = currentLinkedStocks.find((stock) => stock.productId === childProductId)?.stock || 0
				const stock = round(currentStock + qty)

				return {
					productId: childProductId,
					quantity: qty,
					stock,
					transactionId,
					transactionTypeId
				}
			}

			const quantity = products.find((product) => product.productId === childProductId)?.quantity || 0
			const parentQuantity = round(quantity / quantityOnParent)
			const qty =  (type === 'IN') ? parentQuantity : parentQuantity * -1
			const currentStock = currentLinkedStocks.find((stock) => stock.productId === parentProductId)?.stock || 0
			const stock = round(currentStock + qty)

			return {
				productId: parentProductId,
				quantity: qty,
				stock,
				transactionId,
				transactionTypeId
			}
		})
	)
}
