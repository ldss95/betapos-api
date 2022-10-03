import { Model } from 'sequelize'

export interface SettingProps extends Model {
	id: string;
	businessId: string;
	allowGeneridProduct: boolean;
	allowChangeProductPrice: boolean;
}
