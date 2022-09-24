import { Model } from 'sequelize'

import { BarcodeAttr } from '../barcodes/interface'
import { BrandAttr } from '../brands/interface'
import { CategoryAttr } from '../categories/interface'

export interface ProductAttr extends Model {
	id: string;
	businessId: string;
	name: string;
	categoryId: string;
	category: CategoryAttr;
	brandId: string;
	brand: BrandAttr;
	barcodes: BarcodeAttr[];
	referenceCode: string;
	initialStock: number;
	cost: number;
	price: number;
	photoUrl: string;
	itbis: boolean;
	isFractionable: boolean;
	profitPercent: number;
	isActive: boolean;
	deletedAt: string;
	createdAt: string;
	updatedAt: string;
}
