import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { RoleAttr } from './interface'

const Role = db.define<RoleAttr>('role', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING(50),
		unique: true,
		allowNull: false
	},
	code: {
		type: DataTypes.STRING(50),
		unique: true,
		allowNull: false
	},
	description: DataTypes.STRING(300)
})

export { Role }
