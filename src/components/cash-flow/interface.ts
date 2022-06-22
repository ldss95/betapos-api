import { Model } from 'sequelize'
import { BusinessAttr } from '../business/interface'
import { ShiftAttr } from '../shifts/interface'

export interface CashFlowAttr extends Model {
	id: string;
	shiftId: string;
	sihft: ShiftAttr;
	businessId: string;
	business: BusinessAttr;
	amount: number;
	type: 'IN' | 'OUT';
	description: string;
	createdAt: string;
	updatedAt: string;
}
