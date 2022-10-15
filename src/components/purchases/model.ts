import { DataTypes } from 'sequelize'

import { PurchaseProps } from './interface'
import { db } from '../../database/connection'
import { Business } from '../business/model'
import { Provider } from '../providers/model'
import { PurchaseProduct } from '../purchase-products/model'
import { User } from '../users/model'

const Purchase = db.define<PurchaseProps>(
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
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Purchase.hasMany(PurchaseProduct, { foreignKey: 'purchaseId', as: 'products' })
PurchaseProduct.belongsTo(Purchase, { foreignKey: 'purchaseId', as: 'purchase' })

export { Purchase }
