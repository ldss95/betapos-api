import { DataTypes } from 'sequelize';

import { db } from '../../database/connection';
import { PaymentTypeAttr } from './interface';
import { loadInitialData } from '../../utils/shared'

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

loadInitialData(PaymentType, [
	{
		name: 'Efectivo'
	},
	{
		name: 'Tarjeta'
	},
	{
		name: 'Cupon'
	},
	{
		name: 'Nota de credito'
	}
])

export { PaymentType }
