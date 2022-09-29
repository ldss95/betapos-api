import { Model } from 'sequelize'

import { SalePaymentTypeAttr } from '../sales-payments-types/interface'

export interface SalePaymentAttr extends Model {
	id: string;
	saleId: string;
	typeId: string;
	type: SalePaymentTypeAttr;
	amount: number;
	createdAt: string;
	updatedAt: string;
}
