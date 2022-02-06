import { Model } from 'sequelize'

export interface ProvinceAttr extends Model {
	id: string;
	name: string;
}
