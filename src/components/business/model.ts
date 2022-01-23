import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
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
		allowNull: false,
		unique: true,
		validate: {
			isNumeric: true
		}
	},
	logoUrl: DataTypes.STRING(400),
	isActive: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		allowNull: false
	}
})

export { Business }
