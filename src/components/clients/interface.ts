import { Model } from 'sequelize'

export interface ClientProps extends Model {
	id: string;
	groupId: string;
	group: ClientGroupProps;
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

export interface ClientGroupProps extends Model {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}
