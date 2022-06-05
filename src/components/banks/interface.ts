import { Model } from 'sequelize'

export interface BankAttr extends Model {
	id: number;
	name: string;
	createdAt: string;
	updatedAt: string;
}
