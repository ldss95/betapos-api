import { DataTypes } from 'sequelize'

import { PurchaseProductProps } from './interface'
import { db } from '../../database/connection'
import { Product } from '../products/model'

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
	}
)

PurchaseProduct.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

export { PurchaseProduct }
