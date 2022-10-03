import { Model } from 'sequelize'

export interface ClientAttr extends Model {
	id: string;
	groupId: string;
	group: ClientGroupAttr;
	name: string;
	dui: string;
	photoUrl: string;
	email: string;
	phone: string;
	birthDate: string;
	address: string;
	businessId: string;
	hasCredit: boolean;
	creditLimit: number;
	createdAt: string;
	updatedAt: string;
}

export interface ClientGroupAttr extends Model {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}
