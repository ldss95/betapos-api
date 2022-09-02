import { Model } from 'sequelize'

export interface NcfAttr extends Model {
	rnc: string;
	businessName: string;
	statusId: string;
}

export interface NcfStatusAttr extends Model {
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
