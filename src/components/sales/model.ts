import { DataTypes, Op } from 'sequelize'

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
import { StockTransactionTypeId } from '../stocks/interface'

const Sale = db.define<SaleProps>(
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
			afterCreate: async (sale) => {
				const currentStocks = await Stock.findAll({
					where: {
						productId: {
							[Op.in]: sale.products.map(({ productId }) => productId)
						}
					},
					group: ['productId'],
					order: [['createdAt', 'DESC']]
				})

				await Stock.bulkCreate(
					sale.products.map(({ productId, quantity }) => ( {
						productId,
						quantity: quantity * -1,
						stock: (currentStocks.find((stock) => stock.productId === productId)?.stock || 0) - quantity,
						transactionId: sale.id,
						transactionTypeId: StockTransactionTypeId.SALE
					}))
				)
			}
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

export { Sale }
