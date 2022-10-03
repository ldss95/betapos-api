import { Model } from 'sequelize'

export interface BankProps extends Model {
	id: number;
	name: string;
	createdAt: string;
	updatedAt: string;
}
