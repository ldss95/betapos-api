import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { HistoryProps, Table } from './interface'

export const History = db.define<HistoryProps>('history', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	table: {
		type: DataTypes.ENUM(...Object.values(Table)),
		allowNull: false
	},
	identifier: {
		type: DataTypes.UUID,
		allowNull: false
	},
	ip: {
		type: DataTypes.STRING,
		validate: {
			isIP: true
		}
	},
	agent: DataTypes.STRING,
	before: {
		type: DataTypes.JSON,
		allowNull: false
	},
	after: {
		type: DataTypes.JSON,
		allowNull: false
	},
	userId: {
		type: DataTypes.UUID,
		allowNull: false
	}
}, { tableName: 'history', updatedAt: false })
