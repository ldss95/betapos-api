import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { PaymentTypeAttr } from './interface'

const PaymentType = db.define<PaymentTypeAttr>('payment_types', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	description: DataTypes.STRING
})

PaymentType.sync().then(() => {
	PaymentType.bulkCreate(
		[{ name: 'Efectivo' }, { name: 'Cupón' }, { name: 'Tarjeta' }, { name: 'Nota de credito' }],
		{ ignoreDuplicates: true }
	)
})

export { PaymentType }
