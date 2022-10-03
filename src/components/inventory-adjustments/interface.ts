import { Model } from 'sequelize'

import { UserProps } from '../users/interface'

export interface InventoryAdjustmentProps extends Model {
	id: string;
	productId: string;
	userId: string;
	user: UserProps;
	type: 'IN' | 'OUT';
	description: string;
	quantity: number;
	createdAt: string;
	updatedAt: string;
}
