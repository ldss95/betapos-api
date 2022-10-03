import { Model } from 'sequelize'

export interface BusinessTypeProps extends Model {
	id: string;
	name: string;
	description: string;
	code: string;
	createdAt: string;
	updatedAt: string;
}
