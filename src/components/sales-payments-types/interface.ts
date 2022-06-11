import { Model } from 'sequelize'

export interface SalePaymentTypeAttr extends Model {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}
