import { Model } from 'sequelize'

import { BarcodeAttr } from '../barcodes/interface'

export interface ProductAttr extends Model {
	id: string;
	businessId: string;
	name: string;
	brandId: string;
	categoryId: string;
	groupId: string;
	typeId: string;
	barcodes: BarcodeAttr[];
	minStock: number;
	cost: number;
	price: number;
	itbis: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}