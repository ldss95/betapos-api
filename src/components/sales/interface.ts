import { Model } from 'sequelize';

export interface SaleAttr extends Model {
	id: string;
	ticketId: number;
	businessId: string;
	clientId: string;
	sellerId: string;
	amount: number;
	discount: number;
	shiftId: string;
	statusId: string;
	createdAt: string;
	updatedAt: string;
}