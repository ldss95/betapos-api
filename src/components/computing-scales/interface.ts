import { Model } from 'sequelize'

export interface ComputingScaleProps extends Model {
	id: string;
	businessId: string;
	name: string;
	prefix: string;
	barcodeLength: number;
	decimalsWight: number;
	createdAt: string;
	updatedAt: string
}
