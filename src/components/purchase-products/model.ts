import { DataTypes } from 'sequelize'

import { PurchaseProductAttr } from './interface'
import { db } from '../../database/connection'
import { Product } from '../products/model'

const PurchaseProduct = db.define<PurchaseProductAttr>(
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
		price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false
		}
	},
	{ timestamps: false }
)

PurchaseProduct.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

export { PurchaseProduct }
