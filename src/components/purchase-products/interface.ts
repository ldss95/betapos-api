import { Model } from 'sequelize'
import { PurchaseProps } from '../purchases/interface'

export interface PurchaseProductProps extends Model {
	id: string;
	purchaseId: string;
	purchase: PurchaseProps;
	productId: string;
	quantity: number;
	price: number;
	createdAt: string;
	updatedAt: string;
}
