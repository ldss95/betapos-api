import { Model } from 'sequelize'

import { ProviderProps } from '../providers/interface'
import { PurchaseProductProps } from '../purchase-products/interface'

export interface PurchaseProps extends Model {
	id: string;
	businessId: string;
	providerId: string;
	provider?: ProviderProps;
	documentId: string;
	paymentType: 'IMMEDIATE' | 'CREDIT';
	payed: boolean;
	creditDays: number;
	deadline: string;
	affectsExistence: boolean;
	fileUrl: string;
	amount: number;
	date: string;
	products: PurchaseProductProps[];
	adjustPrices: boolean;
	userId: string;
	deletedAt: string;
	createdAt: string;
	updatedAt: string;
}
