import { Model } from 'sequelize'

export interface BarcodeProps extends Model {
	id: string;
	barcode: string;
	productId: string;
	createdAt: string;
	updatedAt: string;
}
