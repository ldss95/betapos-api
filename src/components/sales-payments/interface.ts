import { Model } from 'sequelize'

import { SalePaymentTypeProps } from '../sales-payments-types/interface'

export interface SalePaymentProps extends Model {
	id: string;
	saleId: string;
	typeId: string;
	type: SalePaymentTypeProps;
	amount: number;
	createdAt: string;
	updatedAt: string;
}
