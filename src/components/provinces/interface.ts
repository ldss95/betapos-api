import { Model } from 'sequelize'

export interface ProvinceProps extends Model {
	id: string;
	name: string;
}
