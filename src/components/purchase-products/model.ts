import { DataTypes, Op } from 'sequelize'

import { PurchaseProductProps } from './interface'
import { db } from '../../database/connection'
import { Product } from '../products/model'
import { Stock } from '../stocks/model'
import { StockTransactionTypeId } from '../stocks/interface'

const PurchaseProduct = db.define<PurchaseProductProps>(
	'purchase_product',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		purchaseId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		productId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		quantity: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false
		},
		cost: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false
		},
		price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false
		}
	},
	{
		hooks: {
			afterCreate: async ({ productId, quantity, purchaseId }) => {
				const currentStocks = await Stock.findOne({
					where: {
						productId
					},
					order: [['createdAt', 'DESC']]
				})

				await Stock.create({
					productId,
					quantity: quantity,
					stock: (currentStocks?.stock || 0) + quantity,
					transactionId: purchaseId,
					transactionTypeId: StockTransactionTypeId.PURCHASE
				})
			},
			afterUpdate: async ({ productId, purchaseId, quantity }) => {
				const stock = await Stock.findOne(
					{
						where: {
							[Op.and]: [
								{ transactionId: purchaseId },
								{ productId }
							]
						}
					}
				)
				stock && await stock.update({
					stock: (stock.stock - stock.quantity) + quantity,
					quantity
				})
			}
		}
	}
)

PurchaseProduct.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

export { PurchaseProduct }
