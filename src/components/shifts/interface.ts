import { Model } from 'sequelize'

export interface ShiftAttr extends Model {
	id: string;
	userId: string;
	deviceId: string;
	startAmount: number;
	startTime: string;
	endAmount?: number;
	cashDetails: { type: number; quantity: number }[];
	endTime?: string;
	date: string;
}
