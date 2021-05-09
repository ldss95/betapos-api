import { Model } from 'sequelize';

export interface GroupAttr extends Model {
	id: string;
	businessId: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}
