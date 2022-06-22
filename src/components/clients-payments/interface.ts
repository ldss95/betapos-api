import { Model } from 'sequelize'

export interface ClientPaymentAttr extends Model {
	id: string;
	clientId: string;
	userId: string;
	amount: number;
	description: string;
	createdAt: string;
	updatedAt: string;
}
