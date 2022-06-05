import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { BankAttr } from './interface'

const Bank = db.define<BankAttr>('bank', {
	id: {
		type: DataTypes.TINYINT,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	}
})

export { Bank }
