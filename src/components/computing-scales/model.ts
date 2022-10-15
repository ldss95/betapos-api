import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { Business } from '../business/model'
import { ComputingScaleProps } from './interface'

export const ComputingScale = db.define<ComputingScaleProps>('computing_scale', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	prefix: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	barcodeLength: {
		type: DataTypes.TINYINT,
		allowNull: false
	},
	decimalsWight: {
		type: DataTypes.TINYINT,
		allowNull: false
	}
})

ComputingScale.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })
