import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { Business } from '../business/model'
import { SettingAttr } from './interface'

const Setting = db.define<SettingAttr>('setting', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	allowGeneridProduct: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	allowChangeProductPrice: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

Setting.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })

export { Setting }
