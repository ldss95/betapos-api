import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { LeadProps } from './interface'
import { Province } from '../provinces/model'
import { BusinessType } from '../business-types/model'
import { User } from '../users/model'

export const Lead = db.define<LeadProps>('lead', {
	id: {
		primaryKey: true,
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4
	},
	name: DataTypes.STRING,
	businessName: DataTypes.STRING,
	businessTypeId: DataTypes.UUID,
	latitude: DataTypes.DECIMAL(18, 14),
	longitude: DataTypes.DECIMAL(18, 14),
	address: DataTypes.STRING,
	provinceId: DataTypes.UUID,
	conversionProbability: {
		type: DataTypes.TINYINT,
		allowNull: false,
		validate: {
			min: 1,
			max: 5
		}
	},
	converted: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	phone: DataTypes.STRING,
	email: {
		type: DataTypes.STRING,
		validate: {
			isEmail: true
		}
	},
	userId: DataTypes.UUID
})

Lead.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Lead.belongsTo(Province, { foreignKey: 'provinceId', as: 'province' })
Lead.belongsTo(BusinessType, { foreignKey: 'businessTypeId', as: 'type' })
