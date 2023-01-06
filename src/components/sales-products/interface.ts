import { Model } from 'sequelize'

import { ProductProps } from '../products/interface'
import { SaleProps } from '../sales/interface'

export interface SaleProductProps extends Model {
	id: string;
	saleId: string;
	sale: SaleProps;
	product: ProductProps;
	productId: string;
	quantity: number;
	cost: number;
	price: number;
}
