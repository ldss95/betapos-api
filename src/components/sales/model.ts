import { DataTypes, Op, QueryTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SaleProps } from './interface'
import { SalePayment } from '../sales-payments/model'
import { Device } from '../devices/model'
import { SaleProduct } from '../sales-products/model'
import { User } from '../users/model'
import { Shift } from '../shifts/model'
import { Client } from '../clients/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { Stock } from '../stocks/model'
import { StockProps, StockTransactionTypeId } from '../stocks/interface'
import { ProductLink } from '../products/model'
import { round } from '../../utils/helpers'

export const Sale = db.define<SaleProps>(
	'sale',
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4
		},
		ticketNumber: {
			type: DataTypes.STRING,
			allowNull: false
		},
		ncfTypeId:  DataTypes.STRING(4),
		ncfNumber: DataTypes.INTEGER,
		rnc: DataTypes.STRING(11),
		businessName: DataTypes.STRING,
		businessId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		clientId: DataTypes.UUID,
		sellerId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		deviceId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		amount: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			validate: {
				min: 0
			}
		},
		discount: DataTypes.DOUBLE,
		shiftId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		orderType: {
			type: DataTypes.ENUM('DELIVERY', 'PICKUP'),
			allowNull: false
		},
		shippingAddress: DataTypes.STRING,
		paymentTypeId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		cashReceived: DataTypes.DOUBLE,
		status: {
			type: DataTypes.ENUM('DONE', 'CANCELLED', 'MODIFIED'),
			allowNull: false,
			defaultValue: 'DONE'
		}
	},
	{
		indexes: [
			{
				fields: ['businessId', 'ticketNumber']
			}
		],
		hooks: {
			afterCreate: onCreateSale
		}
	}
)

Sale.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' })
Sale.hasMany(SalePayment, { foreignKey: 'saleId', as: 'payments' })
Sale.hasMany(SaleProduct, { foreignKey: 'saleId', as: 'products' })
SaleProduct.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' })
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' })
Client.hasMany(Sale, { foreignKey: 'clientId', as: 'sales' })
Sale.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' })
Sale.belongsTo(Shift, { foreignKey: 'shiftId', as: 'shift' })
Sale.belongsTo(SalePaymentType, { foreignKey: 'paymentTypeId', as: 'paymentType' })
Shift.hasMany(Sale, { foreignKey: 'shiftId', as: 'sales' })

async function onCreateSale(sale: SaleProps) {
	const currentStocks = await db.query<StockProps>(
		`SELECT
			*
		FROM
			stocks s
		WHERE
			s.createdAt = (
				SELECT
					MAX(createdAt)
				FROM
					stocks
				WHERE
					productId = s.productId
				LIMIT 1
			) AND
			s.productId IN (?)
		GROUP BY s.productId;`,
		{
			replacements: [
				sale.products.map(({ productId }) => productId)
			],
			type: QueryTypes.SELECT
		}
	)

	await Stock.bulkCreate(
		sale.products.map(({ productId, quantity }) => ({
			productId,
			quantity: quantity * -1,
			stock: round(
				(currentStocks.find((stock) => stock.productId === productId)?.stock || 0) -
				quantity
			),
			transactionId: sale.id,
			transactionTypeId: StockTransactionTypeId.SALE
		}))
	)

	// Productos relacionados
	const ids = sale.products.map(({ productId }) => productId)
	const products = await ProductLink.findAll({
		where: {
			[Op.or]: [
				{
					parentProductId: {
						[Op.in]: ids
					}
				},
				{
					childProductId: {
						[Op.in]: ids
					}
				}
			]
		}
	})

	if (products.length === 0) {
		return
	}

	function isParent(id: string) {
		return sale.products.map(({ productId }) => productId).includes(id)
	}

	const currentLinkedStocks = await db.query<StockProps>(
		`SELECT
			*
		FROM
			stocks s
		WHERE
			s.createdAt = (
				SELECT
					MAX(createdAt)
				FROM
					stocks
				WHERE
					productId = s.productId
				LIMIT 1
			) AND
			s.productId IN (?)
		GROUP BY s.productId;`,
		{
			replacements: [
				products
					.map(({ parentProductId, childProductId }) => [parentProductId, childProductId])
					.flat()
			],
			type: QueryTypes.SELECT
		}
	)

	await Stock.bulkCreate(
		products.map(({ parentProductId, childProductId, quantityOnParent }) => {
			if (isParent(parentProductId)) {
				const quantity = sale.products.find((product) => product.productId === parentProductId)?.quantity || 0
				const childQuantity = quantity * quantityOnParent

				return {
					productId: childProductId,
					quantity: childQuantity * -1,
					stock: round(
						(currentLinkedStocks.find((stock) => stock.productId === childProductId)?.stock || 0) -
						childQuantity
					),
					transactionId: sale.id,
					transactionTypeId: StockTransactionTypeId.SALE
				}
			}

			const quantity = sale.products.find((product) => product.productId === childProductId)?.quantity || 0
			const parentQuantity = round(quantity / quantityOnParent)

			return {
				productId: parentProductId,
				quantity: parentQuantity * -1,
				stock: round(
					(currentLinkedStocks.find((stock) => stock.productId === parentProductId)?.stock || 0) -
					parentQuantity
				),
				transactionId: sale.id,
				transactionTypeId: StockTransactionTypeId.SALE
			}
		})
	)
}
