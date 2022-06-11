import { Model } from 'sequelize'

export interface SaleProductAttr extends Model {
	id: string;
	saleId: string;
	productId: string;
	quantity: number;
	price: number;
}
