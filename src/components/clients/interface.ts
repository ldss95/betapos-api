import { Model } from 'sequelize'

import { ClientsGroupProps } from '../clients-groups/interface'
import { ClientPaymentProps } from '../clients-payments/interface'
import { SaleProps } from '../sales/interface'

export interface ClientProps extends Model {
	id: string;
	groupId: string;
	group: ClientsGroupProps;
	name: string;
	dui: string;
	photoUrl: string;
	email: string;
	phone: string;
	birthDate: string;
	address: string;
	businessId: string;
	hasCredit: boolean;
	payments: ClientPaymentProps[];
	sales: SaleProps[];
	creditLimit: number;
	isBusiness: boolean;
	createdAt: string;
	updatedAt: string;
}
