import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { Business } from '../business/model'
import { SettingProps } from './interface'

const Setting = db.define<SettingProps>('setting', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	allowGenericProduct: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	allowChangeProductPrice: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	wsNotificationsNumber: DataTypes.CHAR(10),
	sendShiftNotificationByWs: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

Setting.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })

export { Setting }
