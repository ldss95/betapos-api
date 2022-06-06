import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { RoleAttr } from './interface'

const Role = db.define<RoleAttr>('role', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	clientName: {
		type: DataTypes.STRING(50),
		unique: true,
		allowNull: false
	},
	adminName: {
		type: DataTypes.STRING(50),
		unique: true
	},
	code: {
		type: DataTypes.STRING(50),
		unique: true
	},
	isPublic: {
		type: DataTypes.BOOLEAN,
		allowNull: false
	},
	description: DataTypes.STRING(300)
})

Role.sync().then(() => {
	Role.bulkCreate(
		[
			{
				adminName: 'Administrador',
				code: 'ADMIN',
				isPublic: false,
				description: 'Tiene acceso a un panel especial desde donde podrá gestionar los pagos'
			},
			{
				clientName: 'Administrador',
				adminName: 'Cliente',
				code: 'BIOWNER',
				idPublic: true,
				description:
					'Puede acceder al panel administrativo desde donde podrá configurar todo lo necesario, tambien puede acceder al POS.'
			},
			{
				clientName: 'Vendedor',
				adminName: 'Vendedor',
				isPublic: true,
				code: 'SELLER',
				description: 'Solo puede acceder al POS.'
			},
			{
				adminName: 'Soporte',
				code: 'SUPORT',
				isPublic: false,
				description: 'Puede acceder al panel y aplicacion movil de ayuda para dar soporte a los clientes'
			}
		],
		{ ignoreDuplicates: true }
	)
})

export { Role }
