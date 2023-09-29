import { DataTypes, Op } from 'sequelize'

import { PurchaseProps, PurchaseStatusEnum, PurchaseStatusProps } from './interface'
import { db } from '../../database/connection'
import { Business } from '../business/model'
import { Provider } from '../providers/model'
import { PurchaseProduct } from '../purchase-products/model'
import { User } from '../users/model'
import { Stock } from '../stocks/model'
import { StockTransactionTypeId } from '../stocks/interface'

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

				if (statusId === PurchaseStatusEnum.Finished && purchase.previous('statusId') === PurchaseStatusEnum.Draft) {
					const products = await PurchaseProduct.findAll({
						where: {
							purchaseId: id
						}
					})

					const currentStocks = await Stock.findAll({
						where: {
							productId: {
								[Op.in]: products.map(({ productId }) => productId)
							}
						},
						order: [['createdAt', 'DESC']],
						group: ['productId']
					})

					await Stock.bulkCreate(products.map(({ productId ,quantity }) => ({
						productId,
						stock: (currentStocks.find((stock) => stock.productId === productId)?.stock || 0) + quantity,
						quantity,
						transactionId: id,
						transactionTypeId: StockTransactionTypeId.PURCHASE
					})))
				}
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
