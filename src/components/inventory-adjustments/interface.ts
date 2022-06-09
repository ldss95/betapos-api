import { Model } from 'sequelize'

export interface InventoryAdjustmentAttr extends Model {
	id: string;
	productId: string;
	userId: string;
	type: 'IN' | 'OUT';
	description: string;
	quantity: number;
	createdAt: string;
	updatedAt: string;
}
