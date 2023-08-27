import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { BusinessType } from '../business-types/model'
import { Province } from '../provinces/model'
import { BusinessProps } from './interface'
import { Device } from '../devices/model'
import { notifyUpdate } from '../../utils/helpers'
import { Plan } from '../plans/model'

const Business = db.define<BusinessProps>(
	'business',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		merchantId: {
			type: DataTypes.CHAR(8),
			unique: true
		},
		name: {
			type: DataTypes.STRING(60),
			allowNull: false
		},
		address: DataTypes.STRING(200),
		email: {
			type: DataTypes.STRING(60),
			unique: true,
			validate: {
				isEmail: true
			}
		},
		phone: {
			type: DataTypes.CHAR(10),
			set: function (phone: string) {
				if (phone && phone.length > 0) {
					this.setDataValue('phone', phone.replace(/[^0-9]/g, ''))
				}
			}
		},
		rnc: {
			type: DataTypes.CHAR(11),
			unique: true,
			set: function (value: string) {
				if (!value || value == '') {
					return this.setDataValue('rnc', null)
				}

				this.setDataValue('rnc', value.replace(/[^0-9]/g, ''))
			}
		},
		logoUrl: DataTypes.STRING(400),
		typeId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		provinceId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		referredBy: DataTypes.UUID,
		planId: DataTypes.UUID,
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		}
	},
	{
		hooks: {
			afterCreate: async ({ merchantId }) => {
				notifyUpdate('products', merchantId)
				notifyUpdate('barcodes', merchantId)
				notifyUpdate('users', merchantId)
				notifyUpdate('business', merchantId)
				notifyUpdate('devices', merchantId)
				notifyUpdate('clients', merchantId)
				notifyUpdate('settings', merchantId)
			}
		}
	}
)

Business.belongsTo(BusinessType, { foreignKey: 'typeId', as: 'type' })
Business.belongsTo(Province, { foreignKey: 'provinceId', as: 'province' })
Business.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' })

Business.hasMany(Device, { foreignKey: 'businessId', as: 'devices' })

export { Business }
