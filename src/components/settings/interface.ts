import { Model } from 'sequelize'

export interface SettingProps extends Model {
	id: string;
	businessId: string;
	allowGenericProduct: boolean;
	allowChangeProductPrice: boolean;
	wsNotificationsNumber: string;
	sendShiftNotificationByWs: boolean;
	createdAt: string;
	updatedAt: string;
}
