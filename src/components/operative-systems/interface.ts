import { Model } from 'sequelize'

export interface OsAttr extends Model {
	id: string;
	name: string;
	code: string;
	release: number;
	createdAt: string;
	updatedAt: string;
}
