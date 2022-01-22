import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SaleStatusAttr } from './interface'

const SaleStatus = db.define<SaleStatusAttr>('sale_status', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	description: DataTypes.STRING,
})

export { SaleStatus }
