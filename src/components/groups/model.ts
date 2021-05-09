import { DataTypes } from 'sequelize';

import { db } from '../../database/connection';
import { GroupAttr } from './interface';
import { Business } from '../business/model'

const Group = db.define<GroupAttr>('group', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING(60),
		allowNull: false
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	}
})

Group.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })

export { Group }
