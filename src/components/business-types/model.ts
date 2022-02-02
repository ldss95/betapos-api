import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { BusinessTypeAttr } from './interface'

const BusinessType = db.define<BusinessTypeAttr>('business_types', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	description: DataTypes.STRING,
	code: {
		type: DataTypes.CHAR(4),
		allowNull: false,
		unique: true
	}
})

BusinessType.sync().then(() => {
	BusinessType.bulkCreate(
		[
			{
				name: 'Restaurante',
				code: 'REST'
			},
			{
				name: 'Comedor',
				code: 'COME'
			},
			{
				name: 'Ferreteria',
				code: 'FERR'
			},
			{
				name: 'Farmacia',
				code: 'FARM'
			},
			{
				name: 'Colmado',
				code: 'COLM'
			},
			{
				name: 'Supermercado',
				code: 'SUPE'
			},
			{
				name: 'Minimarket',
				code: 'MIMA'
			},
			{
				name: 'Repuesto',
				code: 'REPU'
			}
		],
		{ ignoreDuplicates: true }
	)
})

export { BusinessType }
