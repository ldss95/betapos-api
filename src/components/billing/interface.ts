import { Model } from 'sequelize'

import { BusinessProps } from '../business/interface'

export interface BillProps extends Model {
	id: string;
	businessId: string;
	business: BusinessProps;
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
