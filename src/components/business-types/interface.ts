import { Model } from 'sequelize'

export interface BusinessTypeAttr extends Model {
	id: string;
	name: string;
	description: string;
	code: string;
	createdAt: string;
	updatedAt: string;
}
