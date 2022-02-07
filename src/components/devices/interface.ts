import { Model } from 'sequelize'

import { OsAttr } from '../operative-systems/interface'

export interface DeviceAttr extends Model {
	id: string;
	deviceId: string;
	osId: string;
	os: OsAttr;
	businessId: string;
	name: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
