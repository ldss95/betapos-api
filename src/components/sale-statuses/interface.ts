import { Model } from 'sequelize'

export interface SaleStatusAttr extends Model {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}
