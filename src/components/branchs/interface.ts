import { Model } from 'sequelize';

export interface BranchAttr extends Model {
	id: string;
	businessId: string;
	name: string;
	address: string;
	phone: string;
	email: string;
	createdAt: string;
	updatedAt: string;
}
