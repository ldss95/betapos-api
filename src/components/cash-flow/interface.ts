import { Model } from 'sequelize'
import { BusinessProps } from '../business/interface'
import { ShiftProps } from '../shifts/interface'

export interface CashFlowProps extends Model {
	id: string;
	shiftId: string;
	sihft: ShiftProps;
	businessId: string;
	business: BusinessProps;
	amount: number;
	type: 'IN' | 'OUT';
	description: string;
	createdAt: string;
	updatedAt: string;
}
