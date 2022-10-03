import { Model } from 'sequelize'
import { SaleProps } from '../sales/interface'

export interface SaleProductProps extends Model {
	id: string;
	saleId: string;
	sale: SaleProps;
	productId: string;
	quantity: number;
	cost: number;
	price: number;
}
