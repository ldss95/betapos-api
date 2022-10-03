import { Model } from 'sequelize'

export interface ClientPaymentProps extends Model {
	id: string;
	clientId: string;
	userId: string;
	amount: number;
	description: string;
	createdAt: string;
	updatedAt: string;
}
