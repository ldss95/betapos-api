import { Model } from 'sequelize'
import { BusinessTypeAttr } from '../business-types/interface'
import { ProvinceAttr } from '../provinces/interface'

export interface BusinessAttr extends Model {
	id: string;
	merchatId: string;
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
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
