import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { RoleAttr } from './interface'

const Role = db.define<RoleAttr>('role', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING(50),
		unique: true,
		allowNull: false
	},
	code: {
		type: DataTypes.STRING(50),
		unique: true,
		allowNull: false
	},
	description: DataTypes.STRING(300)
})

Role.sync().then(() => {
	Role.bulkCreate(
		[
			{
				name: 'Administrador',
				code: 'ADMIN',
				description: 'Tiene acceso a un panel especial desde donde podrá gestionar los pagos'
			},
			{
				name: 'Cliente',
				code: 'BIOWNER',
				description:
					'Puede acceder al panel administrativo desde donde podrá configurar todo lo necesario, tambien puede acceder al POS.'
			},
			{
				name: 'Vendedor',
				code: 'SELLER',
				description: 'Solo puede acceder al POS.'
			}
		],
		{ ignoreDuplicates: true }
	)
})

export { Role }
