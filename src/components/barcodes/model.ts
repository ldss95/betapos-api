import { DataTypes } from 'sequelize';

import { db } from '../../database/connection';
import { BarcodeAttr } from './interface';

const Barcode = db.define<BarcodeAttr>('barcode', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	barcode: {
		type: DataTypes.STRING(30),
		allowNull: false,
		unique: true
	},
	productId: {
		type: DataTypes.UUID,
		allowNull: false
	}
})

export { Barcode }
