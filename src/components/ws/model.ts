import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { Business } from '../business/model'
import { WsSessionProps } from './interface'

export const WsSession = db.define<WsSessionProps>('ws_session', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	}
})

WsSession.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })
