import { Model } from 'sequelize'

export interface RoleProps extends Model {
	id: string;
	clientName: string;
	adminName: string;
	code: string;
	isPublic: boolean;
	description: string;
	createdAt: string;
	updatedAt: string;
}
