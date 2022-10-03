import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SalePaymentTypeProps } from './interface'

const SalePaymentType = db.define<SalePaymentTypeProps>('sales_payment_types', {
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

SalePaymentType.sync().then(() => {
	SalePaymentType.bulkCreate([{ name: 'Efectivo' }, { name: 'Tarjeta' }, { name: 'Fiao' }], {
		ignoreDuplicates: true
	})
})

export { SalePaymentType }
