import { DataTypes } from 'sequelize'

import { PurchaseAttr } from './interface'
import { db } from '../../database/connection'
import { Business } from '../business/model'
import { Provider } from '../providers/model'
import { PurchaseProduct } from '../purchase-products/model'

const Purchase = db.define<PurchaseAttr>(
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
		status: {
			type: DataTypes.ENUM('DONE', 'IN PROGRESS', 'PAUSED'),
			allowNull: false,
			defaultValue: 'IN PROGRESS'
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
		}
	},
	{
		indexes: [
			{
				fields: ['businessId', 'providerId', 'documentId'],
				unique: true
			}
		]
	}
)

Purchase.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })
Purchase.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' })
Purchase.hasMany(PurchaseProduct, { foreignKey: 'purchaseId', as: 'products' })
PurchaseProduct.belongsTo(Purchase, { foreignKey: 'purchaseId', as: 'purchase' })

export { Purchase }
