import { Model } from 'sequelize'

export interface UserAttr extends Model {
	id: string;
	firstName: string;
	lastName: string;
	birthDate: string;
	email: string;
	nickName: string;
	password: string;
	dui: string;
	address: string;
	photoUrl: string;
	roleId: string;
	businessId: string;
	branchId: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}