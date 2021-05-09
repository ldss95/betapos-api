import { Model } from 'sequelize';

export interface CouponAttr extends Model {
	id: number;
	businessId: string;
	branchId: string;
	type: 'PERCENT' | 'AMOUNT'
	conditions: string;
	value: number;
	code: string;
	expireDate: string;
	limit: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
