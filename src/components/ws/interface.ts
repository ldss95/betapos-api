import { Model } from 'sequelize'

import { BusinessProps } from '../business/interface'

export interface WsSessionProps extends Model {
	id: string;
	businessId: string;
	business: BusinessProps;
	createdAt: string;
	updatedAt: string;
}
