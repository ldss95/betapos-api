import { Model } from 'sequelize'

import { ClientAttr } from '../clients/interface'
import { SaleProductAttr } from '../sales-products/interface'
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
	products: SaleProductAttr[];
	amount: number;
	discount: number;
	shiftId: string;
	orderType: 'DELIVERY' | 'PICKUP';
	paymentTypeId: string;
	paymentType: string;
	shippingAddress?: string;
	status: 'DONE' | 'CANCELLED';
	cashReceived?: number;
	createdAt: string;
	updatedAt: string;
}
