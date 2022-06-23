import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SaleProductAttr } from './interface'
import { Product } from '../products/model'

const SaleProduct = db.define<SaleProductAttr>(
	'sales_product',
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4
		},
		saleId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		productId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		quantity: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			validate: {
				min: 0.01
			}
		},
		cost: {
			type: DataTypes.DOUBLE,
			allowNull: false
		},
		price: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			validate: {
				min: 0.01
			}
		}
	},
	{
		indexes: [
			{
				unique: true,
				fields: ['saleId', 'productId']
			}
		]
	}
)

SaleProduct.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

export { SaleProduct }
