import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { Business } from '../business/model'
import { ClientPayment } from '../clients-payments/model'
import { ClientAttr, ClientGroupAttr } from './interface'

const Client = db.define<ClientAttr>(
	'client',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		groupId: DataTypes.UUID,
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		dui: {
			type: DataTypes.CHAR(11),
			set: function (value: string) {
				if (value && value != '') {
					this.setDataValue('dui', value.replace(/[^0-9]/g, ''))
				}
			}
		},
		photoUrl: {
			type: DataTypes.STRING,
			validate: {
				isUrl: true
			}
		},
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			}
		},
		birthDate: DataTypes.DATE,
		phone: {
			type: DataTypes.STRING(15),
			set: function (value: string) {
				if (value && value != '') {
					this.setDataValue('phone', value.replace(/[^0-9]/g, ''))
				}
			}
		},
		address: DataTypes.STRING,
		businessId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		hasCredit: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
		},
		creditLimit: {
			type: DataTypes.MEDIUMINT,
			allowNull: false,
			defaultValue: 0
		}
	},
	{ paranoid: true }
)

const ClientGroup = db.define<ClientGroupAttr>('client_group', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	}
})

Client.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })
Client.belongsTo(ClientGroup, { foreignKey: 'groupId', as: 'group' })
Client.hasMany(ClientPayment, { foreignKey: 'clientId', as: 'payments' })

export { Client }
