import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { InventoryAdjustmentAttr } from './interface'
import { Product } from '../products/model'

const InventoryAdjustment = db.define<InventoryAdjustmentAttr>('inventory_adjustment', {
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
		type: DataTypes.INTEGER,
		allowNull: false
	}
})

InventoryAdjustment.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

export { InventoryAdjustment }
