import { Model } from 'sequelize'
import { PlanFeatureProps } from '../plan-features/interface'

export interface PlanProps extends Model {
	id: string;
	name: string;
	price: number;
	features: PlanFeatureProps[];
	isAvailable: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
