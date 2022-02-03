import { Model } from 'sequelize'

export interface ClientAttr extends Model {
	id: string;
	name: string;
	dui: string;
	photoUrl: string;
	email: string;
	phone: string;
	birthDate: string;
	address: string;
	businessId: string;
	createdAt: string;
	updatedAt: string;
}
