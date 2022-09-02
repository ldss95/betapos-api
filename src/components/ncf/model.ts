import { DataTypes } from 'sequelize'

import { NcfAttr, NcfStatusAttr } from './interface'
import { db } from '../../database/connection'

export const Ncf = db.define<NcfAttr>('ncf', {
	rnc: {
		type: DataTypes.STRING(11),
		primaryKey: true,
		validate: {
			isNumeric: true
		}
	},
	businessName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	statusId: {
		type: DataTypes.UUID,
		allowNull: false
	}
})

export const NcfStatus = db.define<NcfStatusAttr>('ncf_status', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		validate: {
			isIn: [['ACTIVO', 'DADO DE BAJA', 'SUSPENDIDO', 'ANULADO', 'CESE TEMPORAL', 'RECHAZADO', 'NORMAL']]
		}
	}
})

NcfStatus.sync().then(() => {
	NcfStatus.bulkCreate(
		[
			{ name: 'ACTIVO' },
			{ name: 'DADO DE BAJA' },
			{ name: 'SUSPENDIDO' },
			{ name: 'ANULADO' },
			{ name: 'CESE TEMPORAL' },
			{ name: 'RECHAZADO' },
			{ name: 'NORMAL' }
		],
		{ ignoreDuplicates: true }
	)
})

Ncf.belongsTo(NcfStatus, { foreignKey: 'statusId', as: 'status' })
