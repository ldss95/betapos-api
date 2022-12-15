import { Model } from 'sequelize'

export interface NcfProps extends Model {
	rnc: string;
	businessName: string;
	statusId: string;
}

export interface NcfStatusProps extends Model {
	id: string;
	name: NcfStatusName;
}

export type NcfStatusName =
	| 'ACTIVO'
	| 'DADO DE BAJA'
	| 'SUSPENDIDO'
	| 'ANULADO'
	| 'CESE TEMPORAL'
	| 'RECHAZADO'
	| 'NORMAL'
	| string;

export type NcfTypeId = '01' | '02' | '03' | '04' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | 'e-CF';

export interface NcfTypeProps extends Model {
	id: NcfTypeId;
	name: string;
	description: string;
}

export interface NcfAvailabilityProps extends Model {
	id: string;
	businessId: string;
	typeId: NcfTypeId;
	startOn: number;
	stopOn: number;
	expireAt: string;
	createdAt: string;
	updatedAt: string;
}
