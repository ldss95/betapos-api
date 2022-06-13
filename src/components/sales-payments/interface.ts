import { Model } from 'sequelize'

export interface SalePaymentAttr extends Model {
	id: string;
	saleId: string;
	typeId: string;
	amount: number;
	createdAt: string;
	updatedAt: string;
}
