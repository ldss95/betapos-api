import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { Business } from '../business/model'
import { BillProps } from './interface'

const Bill = db.define<BillProps>(
	'bill',
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4
		},
		businessId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		orderNumber: {
			type: DataTypes.CHAR(8),
			allowNull: false,
			unique: true
		},
		stripePayUrl: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true,
			validate: {
				isUrl: true
			}
		},
		transferVoucherUrl: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isUrl: true
			}
		},
		amount: {
			type: DataTypes.MEDIUMINT,
			allowNull: false,
			validate: {
				min: 1000
			}
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false
		},
		payed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		payedAt: DataTypes.DATE
	},
	{
		indexes: [
			{
				unique: true,
				fields: ['businessId', 'createdAt']
			}
		]
	}
)

Bill.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })

export { Bill }
