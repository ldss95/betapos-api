import { Sequelize } from 'sequelize'

const { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER } = process.env

const db = new Sequelize({
	dialect: 'mysql',
	dialectOptions: {
		dateStrings: true,
		typeCast: true,
		decimalNumbers: true
	},
	define: {
		charset: 'utf8',
		collate: 'utf8_general_ci'
	},
	pool: {
		max: 2
	},
	timezone: '-04:00',
	host: DB_HOST,
	username: DB_USER,
	password: DB_PASS,
	port: Number(DB_PORT),
	database: DB_NAME,
	logging: false
})

db.sync()

if (DB_HOST === 'localhost') [
	db.query('SET GLOBAL sql_mode = (SELECT REPLACE(@@sql_mode,"ONLY_FULL_GROUP_BY", ""));')
]

export { db }
