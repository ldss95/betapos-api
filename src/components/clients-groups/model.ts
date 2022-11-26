import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { Business } from '../business/model'
import { ClientsGroupProps } from './interface'


export const ClientsGroup = db.define<ClientsGroupProps>('client_group', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	}
})

ClientsGroup.belongsTo(Business, { foreignKey: 'businessId', as: 'clientsGroups' })
