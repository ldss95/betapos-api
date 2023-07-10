import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { InventoryCountProps, InventoryProps } from './interface'
import { User } from '../users/model'
import { Business } from '../business/model'
import { Product } from '../products/model'

export const Inventory = db.define<InventoryProps>('inventory', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	userId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	isFinished: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

export const InventoryCount = db.define<InventoryCountProps>('inventory_count', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	userId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	inventoryId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	productId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	quantity: {
		type: DataTypes.DECIMAL,
		allowNull: false,
		validate: {
			min: 0.01
		}
	}
})

Inventory.hasMany(InventoryCount, { foreignKey: 'inventoryId', as: 'counts' })
Inventory.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Inventory.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })

InventoryCount.belongsTo(User, { foreignKey: 'userId', as: 'user' })
InventoryCount.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
