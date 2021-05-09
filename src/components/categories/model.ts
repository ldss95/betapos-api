import { DataTypes } from 'sequelize';

import { db } from '../../database/connection';
import { CategoryAttr } from './interface';
import { Business } from '../business/model'

const Category = db.define<CategoryAttr>('category', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING(60),
		allowNull: false
	},
	description: DataTypes.STRING,
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	}
})

Category.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })

export { Category }
