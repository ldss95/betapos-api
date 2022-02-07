import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { Os } from '../operative-systems/model'
import { DeviceAttr } from './interface'

const Device = db.define<DeviceAttr>('device', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	deviceId: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	osId: {
		type: DataTypes.UUID,
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

Device.belongsTo(Os, { foreignKey: 'osId', as: 'os' })

export { Device }
