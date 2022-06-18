import { Model } from 'sequelize'

import { UserAttr } from '../users/interface'

export interface InventoryAdjustmentAttr extends Model {
	id: string;
	productId: string;
	userId: string;
	user: UserAttr;
	type: 'IN' | 'OUT';
	description: string;
	quantity: number;
	createdAt: string;
	updatedAt: string;
}
