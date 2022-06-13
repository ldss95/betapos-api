import { Model } from 'sequelize'
import { PurchaseAttr } from '../purchases/interface'

export interface PurchaseProductAttr extends Model {
	id: string;
	purchaseId: string;
	purchase: PurchaseAttr;
	productId: string;
	quantity: number;
	price: number;
}
