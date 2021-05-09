import { DataTypes } from 'sequelize';

import { db } from '../../database/connection';
import { PaymentAttr } from './interface';
import { PaymentType } from '../payment-types/model'

const Payment = db.define<PaymentAttr>('payment', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	saleId: {
		type: DataTypes.UUIDV4,
		allowNull: false
	},
	typeId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	amount: {
		type: DataTypes.DOUBLE,
		allowNull: false,
		validate: {
			min: 1
		}
	}
})

Payment.hasOne(PaymentType, { foreignKey: 'typeId', as: 'type' })

export { Payment }
