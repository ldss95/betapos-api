import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SalePaymentProps } from './interface'
import { SalePaymentType } from '../sales-payments-types/model'

const SalePayment = db.define<SalePaymentProps>('sales_payment', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	saleId: {
		type: DataTypes.UUID,
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

SalePayment.belongsTo(SalePaymentType, { foreignKey: 'typeId', as: 'type' })

export { SalePayment }
