import { Model } from 'sequelize'

export interface ProviderProps extends Model {
	id: string;
	businessId: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	creditDays: number;
	bankId: string;
	bankAccount: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
