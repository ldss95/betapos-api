import { Model } from 'sequelize'

export interface RoleAttr extends Model {
	id: string;
	name: string;
	code: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}
