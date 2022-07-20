import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { ProductAttr } from './interface'
import { Barcode } from '../barcodes/model'
import { Business } from '../business/model'
import { Brand } from '../brands/model'
import { Category } from '../categories/model'

const Product = db.define<ProductAttr>(
	'product',
	{
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
		referenceCode: DataTypes.STRING(30),
		brandId: DataTypes.UUID,
		categoryId: DataTypes.UUID,
		initialStock: {
			type: DataTypes.MEDIUMINT,
			defaultValue: 0
		},
		cost: DataTypes.DOUBLE,
		price: {
			type: DataTypes.DOUBLE,
			allowNull: false
		},
		itbis: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		},
		photoUrl: {
			type: DataTypes.STRING,
			validate: {
				isUrl: true
			}
		},
		isFractionable: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		}
	},
	{ paranoid: true }
)

Product.hasMany(Barcode, { foreignKey: 'productId', as: 'barcodes' })
Barcode.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
Product.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })
Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' })
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })

export { Product }
