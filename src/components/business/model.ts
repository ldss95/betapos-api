import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { BusinessType } from '../business-types/model'
import { BusinessAttr } from './interface'

const Business = db.define<BusinessAttr>('business', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
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
		set: function(value: string) {
			if(value){
				this.setDataValue('rnc', value.replace(/[^0-9]/g, ''))
			}
		}
	},
	logoUrl: DataTypes.STRING(400),
	typeId: {
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

export { Business }
