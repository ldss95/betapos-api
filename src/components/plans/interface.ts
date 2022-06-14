import { Model } from 'sequelize'
import { PlanFeatureAttr } from '../plan-features/interface'

export interface PlanAttr extends Model {
	id: string;
	name: string;
	price: number;
	features: PlanFeatureAttr[];
	isAvailable: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
