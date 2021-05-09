import { Model } from 'sequelize';

export interface PaymentAttr extends Model {
	id: string;
	saleId: string;
	typeId: string;
	amount: number;
	statusId: string;
	createdAt: string;
	updatedAt: string;
}

export interface PaymentStatusAttr extends Model {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}
