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
	creditDays: number;
	deadline: string;
	affectsExistence: boolean;
	fileUrl: string;
	status: 'DONE' | 'IN PROGRESS' | 'PAUSED';
	amount: number;
	date: string;
	products: PurchaseProductProps[];
	adjustPrices: boolean;
	createdAt: string;
	updatedAt: string;
}
