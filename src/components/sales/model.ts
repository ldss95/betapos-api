import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SaleAttr } from './interface'
import { SaleStatusAttr } from '../sale-statuses/interface'
import { Payment } from '../payments/model'
import { Device } from '../devices/model'

const Sale = db.define<SaleAttr>('sale', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	ticketId: {
		type: DataTypes.BIGINT,
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
	statusId: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 1
	}
})

const SaleStatus = db.define<SaleStatusAttr>('sale_status', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	description: DataTypes.STRING
})

Sale.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' })
Sale.hasOne(SaleStatus, { foreignKey: 'statusId', as: 'status' })
Sale.hasMany(Payment, { foreignKey: 'saleId', as: 'payments' })

export { Sale, SaleStatus }
