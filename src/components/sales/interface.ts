import { Model } from 'sequelize'

export interface SaleAttr extends Model {
	id: string;
	ticketNumber: string;
	businessId: string;
	clientId: string;
	sellerId: string;
	deviceId: string;
	amount: number;
	discount: number;
	shiftId: string;
	orderType: 'DELIVERY' | 'PICKUP';
	shippingAddress?: string;
	status: 'DONE' | 'CANCELLED';
	createdAt: string;
	updatedAt: string;
}
