import { Model } from 'sequelize'

export interface SalePaymentTypeProps extends Model {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}
