import { Model } from 'sequelize'

export interface InventoryProps extends Model {
	id: string;
	businessId: string;
	userId: string;
	isFinished: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface InventoryCountProps extends Model {
	id: string;
	userId: string;
	inventoryId: string;
	productId: number;
	quantity: number;
	createdAt: string;
	updatedAt: string;
}
