import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SaleProps } from './interface'
import { SalePayment } from '../sales-payments/model'
import { Device } from '../devices/model'
import { SaleProduct } from '../sales-products/model'
import { User } from '../users/model'
import { Shift } from '../shifts/model'
import { Client } from '../clients/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { StockTransactionTypeId } from '../stocks/interface'
import { handleStockChanges } from '../stocks/services'

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
			afterCreate: async (sale) => await handleStockChanges({
				products: sale.products.map(({ quantity, productId }) => ({
					productId,
					quantity
				})),
				transactionId: sale.id,
				transactionTypeId: StockTransactionTypeId.SALE,
				type: 'OUT'
			})
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
