import { Model } from 'sequelize'

export interface CategoryProps extends Model {
	id: string;
	businessId: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}
