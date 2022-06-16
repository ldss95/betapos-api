import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SaleAttr } from './interface'
import { SalePayment } from '../sales-payments/model'
import { Device } from '../devices/model'
import { SaleProduct } from '../sales-products/model'
import { User } from '../users/model'
import { Shift } from '../shifts/model'
import { Client } from '../clients/model'

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
		orderType: {
			type: DataTypes.ENUM('DELIVERY', 'PICKUP'),
			allowNull: false
		},
		shippingAddress: DataTypes.STRING,
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
Sale.hasMany(SalePayment, { foreignKey: 'saleId', as: 'payments' })
Sale.hasMany(SaleProduct, { foreignKey: 'saleId', as: 'products' })
SaleProduct.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' })
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' })
Sale.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' })
Sale.belongsTo(Shift, { foreignKey: 'shiftId', as: 'shift' })
Shift.hasMany(Sale, { foreignKey: 'shiftId', as: 'sales' })

export { Sale }
