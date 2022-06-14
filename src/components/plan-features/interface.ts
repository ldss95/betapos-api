import { Model } from 'sequelize'

export interface PlanFeatureAttr extends Model {
	id: string;
	planId: string;
	name: string;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
}
