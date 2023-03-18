import { Model } from 'sequelize'

import { ClientProps } from '../clients/interface'
import { NcfTypeId } from '../ncf/interface'
import { SalePaymentTypeProps } from '../sales-payments-types/interface'
import { SalePaymentProps } from '../sales-payments/interface'
import { SaleProductProps } from '../sales-products/interface'
import { UserProps } from '../users/interface'

export interface SaleProps extends Model {
	id: string;
	ticketNumber: string;
	ncfTypeId: NcfTypeId | null;
	ncfNumber: number | null;
	rnc: string | null;
	businessName: string | null;
	businessId: string;
	clientId: string;
	client: ClientProps;
	sellerId: string;
	seller: UserProps;
	deviceId: string;
	products: SaleProductProps[];
	amount: number;
	itbis?: number;
	discount: number;
	shiftId: string;
	orderType: 'DELIVERY' | 'PICKUP';
	paymentTypeId: string;
	paymentType: SalePaymentTypeProps;
	payments: SalePaymentProps[];
	shippingAddress?: string;
	status: 'DONE' | 'CANCELLED' | 'MODIFIED';
	cashReceived?: number;
	createdAt: string;
	updatedAt: string;
}

export interface SalesSummaryProps {
	week: TransactionsSummaryProps[];
	month: TransactionsSummaryProps[];
	year: TransactionsSummaryProps[];
	today: {
		salesQty: number;
		salesAmount: number;
		profitsAmount: number;
		creditsAmount: number;
	};
}

interface TransactionsSummaryProps {
	salesAmount: number;
	profitsAmount: number;
	creditsAmount: number;
	name: string;
}
