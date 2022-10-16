import { Model } from 'sequelize'

import { BarcodeProps } from '../barcodes/interface'
import { BrandProps } from '../brands/interface'
import { CategoryProps } from '../categories/interface'

export interface ProductProps extends Model {
	id: string;
	businessId: string;
	name: string;
	categoryId: string;
	category: CategoryProps;
	brandId: string;
	brand: BrandProps;
	barcodes: BarcodeProps[];
	referenceCode: string;
	initialStock: number;
	cost: number;
	price: number;
	comercialPrice: number;
	photoUrl: string;
	itbis: boolean;
	isFractionable: boolean;
	profitPercent: number;
	isActive: boolean;
	deletedAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface ProductLinkProps extends Model {
	id: string;
	parentProductId: string;
	childProductId: string;
	quantityOnParent: number;
	parent: ProductProps;
	child: ProductProps;
	createdAt: string;
	updatedAt: string;
}
