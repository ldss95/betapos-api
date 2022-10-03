import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { PlanFeature } from '../plan-features/model'
import { PlanProps } from './interface'

const Plan = db.define<PlanProps>('plan', {
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
	price: {
		type: DataTypes.FLOAT,
		allowNull: false
	},
	isAvailable: {
		type: DataTypes.BOOLEAN,
		allowNull: false
	},
	isActive: {
		type: DataTypes.BOOLEAN,
		allowNull: false
	}
})

Plan.hasMany(PlanFeature, { foreignKey: 'planId', as: 'features' })

export { Plan }
