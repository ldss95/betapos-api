import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { CouponProps } from './interface'

const Coupon = db.define<CouponProps>('coupon', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	type: {
		type: DataTypes.CHAR(7),
		allowNull: false,
		validate: {
			isIn: [['PERCENT', 'AMOUNT']]
		}
	},
	conditions: DataTypes.STRING,
	value: {
		type: DataTypes.DOUBLE,
		allowNull: false,
		validate: {
			min: 1
		}
	},
	code: {
		type: DataTypes.STRING,
		allowNull: false
	},
	expireDate: DataTypes.DATEONLY,
	limit: DataTypes.MEDIUMINT,
	isActive: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true
	}
})

export { Coupon }
