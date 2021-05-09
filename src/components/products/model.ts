import { DataTypes } from 'sequelize';

import { db } from '../../database/connection';
import { ProductAttr } from './interface';
import { Barcode } from '../barcodes/model'
import { Business } from '../business/model'
import { Brand } from '../brands/model'
import { Category } from '../categories/model'
import { Group } from '../groups/model'

const Product = db.define<ProductAttr>('tableName', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING(100),
		allowNull: false
	},
	brandId: DataTypes.UUID,
	categoryId: DataTypes.UUID,
	groupId: DataTypes.UUID,
	typeId: DataTypes.UUID,
	minStock: DataTypes.SMALLINT,
	cost: {
		type: DataTypes.DOUBLE,
		allowNull: false
	},
	price: {
		type: DataTypes.DOUBLE,
		allowNull: false
	},
	itbis: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		allowNull: false
	},
	isActive: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true
	}
})

Product.hasMany(Barcode, { foreignKey: 'productId', as: 'barcodes' })
Product.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })
Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' })
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })
Product.belongsTo(Group, { foreignKey: 'groupId', as: 'group' })

export { Product }
