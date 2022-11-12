import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { InventoryAdjustmentProps } from './interface'
import { Product } from '../products/model'
import { User } from '../users/model'

const InventoryAdjustment = db.define<InventoryAdjustmentProps>('inventory_adjustment', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	productId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	type: {
		type: DataTypes.ENUM('IN', 'OUT'),
		allowNull: false
	},
	description: DataTypes.TEXT,
	quantity: {
		type: DataTypes.DOUBLE,
		allowNull: false
	},
	userId: {
		type: DataTypes.UUID,
		allowNull: false
	}
})

InventoryAdjustment.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
InventoryAdjustment.belongsTo(User, { foreignKey: 'userId', as: 'user' })

export { InventoryAdjustment }
