import { Model } from 'sequelize'

import { BarcodeAttr } from '../barcodes/interface'

export interface ProductAttr extends Model {
	id: string;
	businessId: string;
	name: string;
	categoryId: string;
	barcodes: BarcodeAttr[];
	referenceCode: string;
	initialStock: number;
	cost: number;
	price: number;
	photoUrl: string;
	itbis: boolean;
	isFractionable: boolean;
	isActive: boolean;
	deletedAt: string;
	createdAt: string;
	updatedAt: string;
}
