import express, { Express } from 'express'
import morgan from 'morgan'
import session from 'express-session'
// eslint-disable-next-line
const MySqlStore = require('express-mysql-session')(session);
import cors from 'cors'
import swaggerUI from 'swagger-ui-express'
import swaggerJsDoc from 'swagger-jsdoc'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import 'dotenv/config'

import routes from './routes'
import { addExtraData2Sentry } from './middlewares/errors'

const { PORT, DB_HOST, DB_PASS, DB_NAME, DB_PORT, DB_USER, SECRET_SESSION, NODE_ENV, SENTRY_DSN } = process.env
const app: Express = express()

Sentry.init({
	dsn: SENTRY_DSN,
	integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ app })],
	tracesSampleRate: 1.0,
	environment: NODE_ENV
})

const sessionStore = new MySqlStore({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASS,
	database: DB_NAME,
	port: Number(DB_PORT)
})

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())
app.set('port', PORT || 3000)
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(
	session({
		secret: `${SECRET_SESSION}`,
		store: sessionStore,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false
		}
	})
)
app.use(
	cors({
		origin: (origin, callback) => callback(null, true),
		credentials: true
	})
)

if (NODE_ENV == 'dev') {
	app.use(morgan('dev'))
}

//Swagger UI
const specs = swaggerJsDoc({
	definition: {
		openapi: '3.0.1',
		info: {
			title: 'BETA POS API',
			version: '1.0.1',
			description: 'API para las aplicaciones de BETA POS'
		},
		securityDefinitions: {
			auth: {
				type: 'basic'
			}
		},
		security: [
			{
				bearerAuth: [],
				auth: []
			}
		],
		servers: [
			{
				url: 'https://betapos.com.do/api'
			},
			{
				url: 'http://localhost:4012'
			}
		]
	},
	apis: ['./src/components/**/docs.ts']
})

app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs))
app.use(routes)
app.use(addExtraData2Sentry)
app.use(Sentry.Handlers.errorHandler())

export { app }
