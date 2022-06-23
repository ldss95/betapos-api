import { Model } from 'sequelize'
import { SaleAttr } from '../sales/interface'

export interface SaleProductAttr extends Model {
	id: string;
	saleId: string;
	sale: SaleAttr;
	productId: string;
	quantity: number;
	cost: number;
	price: number;
}
