import { Model } from 'sequelize'

export interface RoleProps extends Model {
	id: string;
	clientName: string;
	adminName: string;
	code: RoleCode;
	isPublic: boolean;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export type RoleCode = 'ADMIN' | 'BIOWNER' | 'SELLER' | 'PARTNER' | 'SUPPORT';
