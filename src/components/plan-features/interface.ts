import { Model } from 'sequelize'

export interface PlanFeatureProps extends Model {
	id: string;
	planId: string;
	name: string;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
}
