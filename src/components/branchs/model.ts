import { DataTypes } from 'sequelize';

import { db } from '../../database/connection';
import { BranchAttr } from './interface';

const Branch = db.define<BranchAttr>('branch', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	address: DataTypes.STRING,
	phone: DataTypes.CHAR(10),
	email: {
		type: DataTypes.STRING,
		allowNull: true,
		validate: {
			isEmail: true
		}
	}
})

export { Branch }
