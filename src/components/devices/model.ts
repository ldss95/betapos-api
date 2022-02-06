import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { DeviceAttr } from './interface'

const Device = db.define<DeviceAttr>('device', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	os: {
		type: DataTypes.STRING,
		allowNull: false
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	isActive: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true
	}
})

export { Device }
