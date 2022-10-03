import { DataTypes } from 'sequelize'

import { db } from '../../database/connection'
import { OsProps } from './interface'

const Os = db.define<OsProps>('operative_system', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	code: {
		type: DataTypes.ENUM('darwin', 'linux', 'win32'),
		allowNull: false
	},
	release: {
		type: DataTypes.TINYINT,
		allowNull: false
	}
})

export { Os }
