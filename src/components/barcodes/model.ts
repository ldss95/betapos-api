import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { BarcodeProps } from './interface'

const Barcode = db.define<BarcodeProps>('barcode', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	barcode: {
		type: DataTypes.STRING(60),
		allowNull: false,
		unique: true
	},
	productId: {
		type: DataTypes.UUID,
		allowNull: false
	}
})

export { Barcode }
