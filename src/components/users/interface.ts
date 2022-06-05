import { Model } from 'sequelize'

import { BusinessAttr } from '../business/interface'

export interface UserAttr extends Model {
	id: string;
	firstName: string;
	lastName: string;
	birthDate: string;
	email?: string;
	nickName?: string;
	password: string;
	dui: string;
	gender: 'M' | 'F' | 'O';
	address: string;
	photoUrl: string;
	roleId: string;
	businessId: string;
	business: BusinessAttr;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
