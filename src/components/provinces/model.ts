import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { ProvinceAttr } from './interface'

const Province = db.define<ProvinceAttr>(
	'province',
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		}
	},
	{ timestamps: false }
)

export { Province }
