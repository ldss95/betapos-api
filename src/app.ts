import express, { Express } from 'express'
import morgan from 'morgan'
import session from 'express-session'
const MySqlStore = require('express-mysql-session')(session)
import cors from 'cors'
import 'dotenv/config'

import routes from './routes'

const app: Express = express()

const { PORT, DB_HOST, DB_PASS, DB_NAME, DB_PORT, DB_USER, SECRET_SESSION, NODE_ENV } = process.env

const sessionStore = new MySqlStore({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASS,
	database: DB_NAME,
	port: Number(DB_PORT)
})

app.set('port', PORT || 3000)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
	secret: `${SECRET_SESSION}`,
	store: sessionStore,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false
	}
}))
app.use(cors({
	origin: (origin, callback) => callback(null, true), 
	credentials: true
}))

if (NODE_ENV == 'dev') {
	app.use(morgan('dev'))
}

app.use(routes)

export { app }