import { Model } from 'sequelize'

import { BusinessAttr } from '../business/interface'
import { RoleAttr } from '../roles/interface'

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
	role: RoleAttr;
	businessId: string;
	business: BusinessAttr;
	partnerCode: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
