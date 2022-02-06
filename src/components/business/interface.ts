import { Model } from 'sequelize'

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
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
