import { Model } from 'sequelize'

import { BusinessProps } from '../business/interface'
import { RoleProps } from '../roles/interface'

export interface UserProps extends Model {
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
	role: RoleProps;
	businessId: string;
	business: BusinessProps;
	partnerCode: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
