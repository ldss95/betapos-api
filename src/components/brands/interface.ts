import { Model } from 'sequelize'

export interface BrandProps extends Model {
	id: string;
	businessId: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}
