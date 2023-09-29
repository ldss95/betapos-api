import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { ProviderProps } from './interface'
import { Business } from '../business/model'
import { Bank } from '../banks/model'
import { Ncf } from '../ncf/model'

const Provider = db.define<ProviderProps>(
	'provider',
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4
		},
		businessId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			}
		},
		rnc: DataTypes.STRING(11),
		phone: {
			type: DataTypes.CHAR(10),
			set: function (phone: string) {
				if (phone && isNaN(Number(phone))) {
					this.setDataValue('phone', phone.replace(/[^0-9]/g, ''))
				}
			}
		},
		address: DataTypes.STRING,
		creditDays: DataTypes.SMALLINT,
		bankId: DataTypes.TINYINT,
		bankAccount: DataTypes.STRING,
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		}
	},
	{
		indexes: [
			{
				fields: ['businessId', 'name'],
				unique: true
			},
			{
				fields: ['businessId', 'email'],
				unique: true
			},
			{
				fields: ['businessId', 'bankAccount'],
				unique: true
			}
		]
	}
)

Provider.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })
Provider.belongsTo(Bank, { foreignKey: 'bankId', as: 'bank' })
Provider.belongsTo(Ncf, { foreignKey: 'rnc', as: 'rncIdentity' })

export { Provider }
