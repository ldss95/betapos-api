import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { CategoryProps } from './interface'
import { Business } from '../business/model'

const Category = db.define<CategoryProps>(
	'category',
	{
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
	},
	{
		indexes: [
			{
				name: 'unique_category_name_by_business',
				unique: true,
				fields: ['businessId', 'name']
			}
		]
	}
)

Category.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })

export { Category }
