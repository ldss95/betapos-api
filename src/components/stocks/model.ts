import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { Product } from '../products/model'
import { StockProps, StockTransactionTypeProps } from './interface'

export const Stock = db.define<StockProps>('stock', {
	id: {
		primaryKey: true,
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4
	},
	productId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	stock: {
		type: DataTypes.DOUBLE,
		allowNull: false
	},
	quantity: {
		type: DataTypes.DOUBLE,
		allowNull: false
	},
	transactionId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	transactionTypeId: {
		type: DataTypes.UUID,
		allowNull: false
	}
})

export const StockTransactionType = db.define<StockTransactionTypeProps>('stock_transaction_type', {
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
}, { timestamps: false })

Stock.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
Stock.belongsTo(StockTransactionType, { foreignKey: 'transactionTypeId', as: 'type' })
