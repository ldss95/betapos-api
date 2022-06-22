import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { ClientPaymentAttr } from './interface'

const ClientPayment = db.define<ClientPaymentAttr>('clients_payment', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	clientId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	userId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	amount: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false
	},
	description: {
		type: DataTypes.STRING,
		allowNull: false
	}
})

export { ClientPayment }
