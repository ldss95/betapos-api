import { Model } from 'sequelize'

import { ClientAttr } from '../clients/interface'
import { UserAttr } from '../users/interface'

export interface SaleAttr extends Model {
	id: string;
	ticketNumber: string;
	businessId: string;
	clientId: string;
	client: ClientAttr;
	sellerId: string;
	seller: UserAttr;
	deviceId: string;
	amount: number;
	discount: number;
	shiftId: string;
	orderType: 'DELIVERY' | 'PICKUP';
	paymentTypeId: string;
	paymentType: string;
	shippingAddress?: string;
	status: 'DONE' | 'CANCELLED';
	createdAt: string;
	updatedAt: string;
}
