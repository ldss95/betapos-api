import { Model } from 'sequelize'
import { BusinessTypeProps } from '../business-types/interface'
import { DeviceProps } from '../devices/interface'
import { ProvinceProps } from '../provinces/interface'

export interface BusinessProps extends Model {
	id: string;
	merchantId: string;
	name: string;
	address: string;
	email: string;
	phone: string;
	rnc: string;
	logoUrl: string;
	typeId: string;
	type?: BusinessTypeProps;
	provinceId: string;
	province?: ProvinceProps;
	devices: DeviceProps[];
	referredBy: string;
	planId: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
