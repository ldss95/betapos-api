import { Model } from 'sequelize'

export interface StockProps extends Model {
	id: string;
	productId: string;
	stock: number;
	quantity: number;
	transactionId: string;
	transactionTypeId: string;
	user?: string;
	createdAt: string;
	updatedAt: string;
}

export interface StockTransactionTypeProps extends Model {
	id: string;
	name: string;
}

export enum StockTransactionTypeId {
	SALE = '53d60959-5ace-489d-a33a-f6fa0dd3be9a',
	PURCHASE = 'dc85eb8a-eb9a-45fb-b83b-a7a12d9be10c',
	INVENTORY_ADJUSTMENT = '3ddcab5c-6e08-4f61-8569-ce3d16ba6a53'
}
