import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { BusinessType } from '../business-types/model'
import { Province } from '../provinces/model'
import { BusinessAttr } from './interface'

const Business = db.define<BusinessAttr>('business', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	merchantId: {
		type: DataTypes.CHAR(9),
		unique: true,
		set: async function () {
			/**
			 * Obtiene un string de 9 caracteres unico para ser usado como merchant id de un
			 * negoci en el formato AA 999999
			 */
			const merchantId = async (): Promise<string> => {
				const firstChar = String.fromCharCode(Math.random() * (90 - 65) + 65) // A-Z
				const lastChar = String.fromCharCode(Math.random() * (90 - 65) + 65) // A-Z
				const rdNumber = Math.round(Math.random() * (0 - 999999) + 999999) // 000000 - 999999

				const code = firstChar + lastChar + ' ' + rdNumber.toString().padStart(6, '0')
				const codeTakend = await Business.count({ where: { merchatId: code } })

				if (!codeTakend) {
					return code
				}

				return await merchantId()
			}

			this.setDataValue('merchatId', merchantId())
		}
	},
	name: {
		type: DataTypes.STRING(60),
		allowNull: false
	},
	address: DataTypes.STRING(200),
	email: {
		type: DataTypes.STRING(60),
		allowNull: false,
		unique: true,
		validate: {
			isEmail: true
		}
	},
	phone: DataTypes.CHAR(10),
	rnc: {
		type: DataTypes.CHAR(9),
		unique: true,
		set: function (value: string) {
			if (value) {
				this.setDataValue('rnc', value.replace(/[^0-9]/g, ''))
			}
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
})

Business.belongsTo(BusinessType, { foreignKey: 'typeId', as: 'type' })
Business.belongsTo(Province, { foreignKey: 'provinceId', as: 'province' })

export { Business }
