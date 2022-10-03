import { Model } from 'sequelize'

import { ProviderAttr } from '../providers/interface'
import { PurchaseProductAttr } from '../purchase-products/interface'

export interface PurchaseAttr extends Model {
	id: string;
	businessId: string;
	providerId: string;
	provider?: ProviderAttr;
	documentId: string;
	paymentType: 'IMMEDIATE' | 'CREDIT';
	creditDays: number;
	deadline: string;
	affectsExistence: boolean;
	fileUrl: string;
	status: 'DONE' | 'IN PROGRESS' | 'PAUSED';
	amount: number;
	date: string;
	products: PurchaseProductAttr[];
	adjustPrices: boolean;
	createdAt: string;
	updatedAt: string;
}
