import { Model } from 'sequelize'

export interface StockProps extends Model {
	id: string;
	productId: string;
	stock: number;
	quantity: number;
	transactionId: string;
	transactionTypeId: string;
	createdAt: string;
	updatedAt: string;
}

export interface StockTransactionTypeProps extends Model {
	id: string;
	name: string;
}
