import express from 'express'
import session from 'express-session'
const MySqlStore = require('express-mysql-session')(session)
import path from 'path'
import 'dotenv/config'
import routes from './routes/routes'
const server = express()

server.set('port', process.env.PORT || 3000)
const sessionStore = new MySqlStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306
})

server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(express.static(path.join(__dirname, 'public')))
server.use(session({
    secret: process.env.SECRET_SESSION || '',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}))

server.use(routes)
server.listen(server.get('port'))