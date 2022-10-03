import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { ShiftProps } from './interface'
import { User } from '../users/model'
import { Device } from '../devices/model'

const Shift = db.define<ShiftProps>(
	'shift',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
			unique: true
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		deviceId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		startAmount: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		startTime: {
			type: DataTypes.TIME,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		endAmount: {
			type: DataTypes.FLOAT,
			allowNull: true
		},
		cashDetail: {
			type: DataTypes.JSON,
			allowNull: true
		},
		endTime: {
			type: DataTypes.TIME,
			allowNull: true
		},
		date: {
			type: DataTypes.DATEONLY,
			defaultValue: DataTypes.NOW,
			allowNull: false
		}
	},
	{ timestamps: false }
)

Shift.belongsTo(User, { foreignKey: 'userId' })
Shift.belongsTo(Device, { foreignKey: 'deviceId' })

export { Shift }
