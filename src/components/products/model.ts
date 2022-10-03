import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { ProductProps, ProductLinkProps } from './interface'
import { Barcode } from '../barcodes/model'
import { Business } from '../business/model'
import { Brand } from '../brands/model'
import { Category } from '../categories/model'

const Product = db.define<ProductProps>(
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
		profitPercent: {
			type: DataTypes.DOUBLE(10, 2),
			allowNull: false,
			defaultValue: 20,
			validate: {
				min: 0
			}
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		}
	},
	{ paranoid: true }
)

export const ProductLink = db.define<ProductLinkProps>('products_link', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	parentProductId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	childProductId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	quantityOnParent: {
		type: DataTypes.DOUBLE(10, 2),
		validate: {
			min: 2
		}
	}
})

Product.hasMany(Barcode, { foreignKey: 'productId', as: 'barcodes' })
Product.hasMany(ProductLink, { foreignKey: 'parentProductId', as: 'linkedProducts' })

Barcode.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
Product.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })
Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' })
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })

export { Product }
