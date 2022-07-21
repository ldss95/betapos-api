import { Model } from 'sequelize'

export interface BillAttr extends Model {
	id: string;
	businessId: string;
	orderNumber: string;
	uepaPayOrderNumber: string;
	uepaPayLink: string;
	amount: number;
	description: string;
	payed: boolean;
	createdAt: string;
	updatedAt: string;
}
