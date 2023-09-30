import { DataTypes, Op, QueryTypes } from 'sequelize'

import { PurchaseProps, PurchaseStatusEnum, PurchaseStatusProps } from './interface'
import { db } from '../../database/connection'
import { Business } from '../business/model'
import { Provider } from '../providers/model'
import { PurchaseProduct } from '../purchase-products/model'
import { User } from '../users/model'
import { Stock } from '../stocks/model'
import { StockProps, StockTransactionTypeId } from '../stocks/interface'
import { ProductLink } from '../products/model'
import { round } from '../../utils/helpers'

export const Purchase = db.define<PurchaseProps>(
	'purchase',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		businessId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		providerId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		documentId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		paymentType: {
			type: DataTypes.ENUM('IMMEDIATE', 'CREDIT'),
			allowNull: false
		},
		payed: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
		creditDays: DataTypes.SMALLINT,
		deadline: DataTypes.DATEONLY,
		affectsExistence: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
		fileUrl: {
			type: DataTypes.STRING,
			validate: {
				isUrl: true
			}
		},
		amount: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			validate: {
				min: 1
			}
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
		adjustPrices: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		ncf: DataTypes.STRING(19),
		statusId: {
			type: DataTypes.UUID,
			defaultValue: PurchaseStatusEnum.Draft
		}
	},
	{
		paranoid: true,
		indexes: [
			{
				fields: ['businessId', 'providerId', 'documentId'],
				unique: true
			},
			{
				fields: ['providerId', 'ncf']
			}
		],
		hooks: {
			afterUpdate: async (purchase) => {
				if (!purchase.affectsExistence) {
					return
				}

				const { statusId, id } = purchase

				if (statusId === PurchaseStatusEnum.Draft) {
					return
				}

				if (purchase.previous('statusId') === PurchaseStatusEnum.Finished) {
					return
				}

				const purchaseProducts = await PurchaseProduct.findAll({
					where: {
						purchaseId: id
					}
				})

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
							purchaseProducts.map(({ productId }) => productId),
						],
						type: QueryTypes.SELECT
					}
				)

				await Stock.bulkCreate(
					purchaseProducts.map(({ productId, quantity }) => ({
						productId,
						quantity: quantity,
						stock: round(
							(currentStocks.find((stock) => stock.productId === productId)?.stock || 0) +
							quantity
						),
						transactionId: purchase.id,
						transactionTypeId: StockTransactionTypeId.SALE
					}))
				)

				// Productos relacionados
				const ids = purchaseProducts.map(({ productId }) => productId)
				const products = await ProductLink.findAll({
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

				if (products.length === 0) {
					return
				}

				function isParent(id: string) {
					return purchaseProducts.map(({ productId }) => productId).includes(id)
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
							products
								.map(({ parentProductId, childProductId }) => [parentProductId, childProductId])
								.flat()
						],
						type: QueryTypes.SELECT
					}
				)

				await Stock.bulkCreate(
					products.map(({ parentProductId, childProductId, quantityOnParent }) => {
						if (isParent(parentProductId)) {
							const quantity = purchaseProducts.find((product) => product.productId === parentProductId)?.quantity || 0
							const childQuantity = quantity * quantityOnParent

							return {
								productId: childProductId,
								quantity: childQuantity,
								stock: round(
									(currentLinkedStocks.find((stock) => stock.productId === childProductId)?.stock || 0)
									+ childQuantity
								),
								transactionId: purchase.id,
								transactionTypeId: StockTransactionTypeId.SALE
							}
						}

						const quantity = purchaseProducts.find((product) => product.productId === childProductId)?.quantity || 0
						const parentQuantity = round(quantity / quantityOnParent)

						return {
							productId: parentProductId,
							quantity: parentQuantity,
							stock: round(
								(currentLinkedStocks.find((stock) => stock.productId === parentProductId)?.stock || 0) +
								parentQuantity
							),
							transactionId: purchase.id,
							transactionTypeId: StockTransactionTypeId.SALE
						}
					})
				)
			}
		}
	}
)

export const PurchaseStatus = db.define<PurchaseStatusProps>('purchases_status', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	description: DataTypes.TEXT,
})

Purchase.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })
Purchase.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' })
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Purchase.belongsTo(PurchaseStatus, { foreignKey: 'statusId', as: 'status' })
Purchase.hasMany(PurchaseProduct, { foreignKey: 'purchaseId', as: 'products' })
PurchaseProduct.belongsTo(Purchase, { foreignKey: 'purchaseId', as: 'purchase' })
