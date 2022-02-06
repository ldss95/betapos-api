import { Model } from 'sequelize'

export interface DeviceAttr extends Model {
	id: string;
	os: string;
	businessId: string;
	name: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
