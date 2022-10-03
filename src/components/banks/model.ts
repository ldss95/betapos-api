import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { BankProps } from './interface'

const Bank = db.define<BankProps>('bank', {
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
