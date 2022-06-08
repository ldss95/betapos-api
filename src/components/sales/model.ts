import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SaleAttr } from './interface'
import { Payment } from '../payments/model'
import { Device } from '../devices/model'
import { SaleProduct } from '../sale-products/model'
import { User } from '../users/model'

const Sale = db.define<SaleAttr>(
	'sale',
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4
		},
		ticketNumber: {
			type: DataTypes.STRING,
			allowNull: false
		},
		businessId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		clientId: DataTypes.UUID,
		sellerId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		deviceId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		amount: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			validate: {
				min: 0
			}
		},
		discount: DataTypes.DOUBLE,
		shiftId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		status: {
			type: DataTypes.ENUM('DONE', 'CANCELLED'),
			allowNull: false,
			defaultValue: 'DONE'
		}
	},
	{
		indexes: [
			{
				fields: ['businessId', 'ticketNumber']
			}
		]
	}
)

Sale.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' })
Sale.hasMany(Payment, { foreignKey: 'saleId', as: 'payments' })
Sale.hasMany(SaleProduct, { foreignKey: 'saleId', as: 'products' })
Sale.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' })

export { Sale }
