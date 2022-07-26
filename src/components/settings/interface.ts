import { Model } from 'sequelize'

export interface SettingAttr extends Model {
	id: string;
	businessId: string;
	allowGeneridProduct: boolean;
	allowChangeProductPrice: boolean;
}
