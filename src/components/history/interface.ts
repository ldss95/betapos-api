import { Model } from 'sequelize'

import { UserProps } from '../users/interface'

export interface HistoryProps extends Model {
	id: string;
	table: string;
	identifier: string;
	ip: string | null;
	os: string | null;
	before: JSON;
	after: JSON;
	userId: string;
	user: UserProps;
	createdAt: string;
}

export enum Table {
	PRODUCTS = 'products',
	BARCODES = 'barcodes'
}

export interface HistoryAdditionalProps {
	userId: string;
	ip?: string;
	agent?: string;
}
