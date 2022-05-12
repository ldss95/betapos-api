import { DataTypes } from 'sequelize'
import { duiIsValid } from '@ldss95/helpers'
import bcrypt from 'bcrypt'

import { db } from '../../database/connection'
import { UserAttr } from './interface'
import { Role } from '../roles/model'
import { Business } from '../business/model'

const User = db.define<UserAttr>('user', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	firstName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	birthDate: DataTypes.DATEONLY,
	email: {
		type: DataTypes.STRING(60),
		allowNull: false,
		unique: true,
		validate: {
			isEmail: true
		}
	},
	nickName: {
		type: DataTypes.STRING(16),
		unique: true
	},
	password: {
		type: DataTypes.STRING(200),
		allowNull: false
	},
	dui: {
		type: DataTypes.CHAR(11),
		validate: {
			isNumeric: true,
			wrongDui(dui: string) {
				if (!duiIsValid(dui)) {
					throw new Error('Cedula Invalida')
				}
			}
		},
		unique: true,
		set: function (dui: string) {
			if (dui) {
				this.setDataValue('dui', dui.replace(/[^0-9]/g, ''))
			}
		}
	},
	gender: {
		type: DataTypes.ENUM('M', 'F', 'O'),
		allowNull: false
	},
	address: DataTypes.STRING(200),
	photoUrl: DataTypes.STRING(400),
	roleId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	businessId: DataTypes.UUID,
	isActive: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true
	}
})

User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' })
User.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })

export { User }
