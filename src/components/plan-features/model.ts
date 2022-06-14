import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { PlanFeatureAttr } from './interface'

const PlanFeature = db.define<PlanFeatureAttr>('plan_feature', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	planId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	isAvailable: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true
	}
})

export { PlanFeature }
