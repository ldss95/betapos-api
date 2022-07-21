import { Model } from 'sequelize'
import { BusinessTypeAttr } from '../business-types/interface'
import { DeviceAttr } from '../devices/interface'
import { ProvinceAttr } from '../provinces/interface'

export interface BusinessAttr extends Model {
	id: string;
	merchantId: string;
	name: string;
	address: string;
	email: string;
	phone: string;
	rnc: string;
	logoUrl: string;
	typeId: string;
	type?: BusinessTypeAttr;
	provinceId: string;
	province?: ProvinceAttr;
	devices: DeviceAttr[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
