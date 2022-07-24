import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { BusinessType } from '../business-types/model'
import { Province } from '../provinces/model'
import { BusinessAttr } from './interface'
import { db as firebaseCon } from '../../database/firebase'
import moment from 'moment'
import { Device } from '../devices/model'

const Business = db.define<BusinessAttr>(
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
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		}
	},
	{
		hooks: {
			afterCreate: async ({ merchantId }) => {
				firebaseCon
					.collection(merchantId)
					.doc('products')
					.set({
						lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
					})

				firebaseCon
					.collection(merchantId)
					.doc('barcodes')
					.set({
						lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
					})

				firebaseCon
					.collection(merchantId)
					.doc('users')
					.set({
						lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
					})

				firebaseCon
					.collection(merchantId)
					.doc('business')
					.set({
						lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
					})

				firebaseCon
					.collection(merchantId)
					.doc('devices')
					.set({
						lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
					})

				firebaseCon
					.collection(merchantId)
					.doc('clients')
					.set({
						lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
					})
			}
		}
	}
)

Business.belongsTo(BusinessType, { foreignKey: 'typeId', as: 'type' })
Business.belongsTo(Province, { foreignKey: 'provinceId', as: 'province' })

Business.hasMany(Device, { foreignKey: 'businessId', as: 'devices' })

export { Business }
