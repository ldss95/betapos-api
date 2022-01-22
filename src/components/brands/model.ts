import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { BrandAttr } from './interface'
import { Business } from '../business/model'

const Brand = db.define<BrandAttr>('brand', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING(60),
		allowNull: false,
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
})

Brand.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })

export { Brand }
