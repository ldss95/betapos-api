import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { User } from '../users/model'
import { ClientPaymentProps } from './interface'

const ClientPayment = db.define<ClientPaymentProps>('clients_payment', {
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
	description: DataTypes.STRING
})

ClientPayment.belongsTo(User, { foreignKey: 'userId', as: 'user' })

export { ClientPayment }
