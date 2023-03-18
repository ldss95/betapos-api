import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SaleProductProps } from './interface'
import { Product } from '../products/model'
import { Sale } from '../sales/model'

const SaleProduct = db.define<SaleProductProps>(
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
			defaultValue: 0
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
		paranoid: true,
		hooks: {
			afterDestroy: async ({ saleId }) => {
				await Sale.update({ status: 'MODIFIED' }, {
					where: { id: saleId }
				})
			}
		}
	}
)

SaleProduct.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

export { SaleProduct }
