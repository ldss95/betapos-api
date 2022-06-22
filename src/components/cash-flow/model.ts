import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { Business } from '../business/model'
import { Shift } from '../shifts/model'
import { CashFlowAttr } from './interface'

const CashFlow = db.define<CashFlowAttr>('cash_flow', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	shiftId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	amount: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false
	},
	type: {
		type: DataTypes.ENUM('IN', 'OUT'),
		allowNull: false
	},
	description: {
		type: DataTypes.STRING,
		allowNull: false
	}
})

CashFlow.belongsTo(Shift, { foreignKey: 'shiftId', as: 'shift' })
CashFlow.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })

export { CashFlow }
