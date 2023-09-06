import { Model } from 'sequelize'

import { BusinessTypeProps } from '../business-types/interface'
import { UserProps } from '../users/interface'
import { ProvinceProps } from '../provinces/interface'

export interface LeadProps extends Model {
	id: string;
	name: string;
	businessName: string;
	businessTypeId: string;
	businessType: BusinessTypeProps;
	latitude: number;
	longitude: number;
	address: string;
	provinceId: string;
	province: ProvinceProps;
	conversionProbability: number;
	converted: boolean;
	userId: string;
	user: UserProps;
	phone: string;
	email: string;
	createdAt: string;
	updatedAt: string;
}
