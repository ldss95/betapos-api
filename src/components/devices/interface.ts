import { Model } from 'sequelize'

import { OsProps } from '../operative-systems/interface'

export interface DeviceProps extends Model {
	id: string;
	deviceId: string;
	osId: string;
	os: OsProps;
	businessId: string;
	name: string;
	pushNotificationsToken: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
