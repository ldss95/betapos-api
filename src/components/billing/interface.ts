import { Model } from 'sequelize'

export interface BillAttr extends Model {
	id: string;
	businessId: string;
	orderNumber: string;
	uepaPayOrderNumber?: string;
	uepaPayLink?: string;
	transferVoucherUrl?: string;
	amount: number;
	description: string;
	payed: boolean;
	payedAt: string;
	createdAt: string;
	updatedAt: string;
}
