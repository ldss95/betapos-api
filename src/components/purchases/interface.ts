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
	ncf: string;
	statusId: string;
	status: PurchaseStatusProps;
	deletedAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface PurchaseStatusProps extends Model {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export enum PurchaseStatusEnum {
	Draft = 'f6960d16-b021-425c-b590-13f9e98247e9',
	Finished = 'c637cd84-924d-4777-92ca-d6c4fec197b7'
}
