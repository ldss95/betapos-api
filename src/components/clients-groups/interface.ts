import { Model } from 'sequelize'

export interface ClientsGroupProps extends Model {
	id: string;
	businessId: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}
