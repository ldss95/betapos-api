import { Model } from 'sequelize'

export interface OsProps extends Model {
	id: string;
	name: string;
	code: string;
	release: number;
	createdAt: string;
	updatedAt: string;
}
