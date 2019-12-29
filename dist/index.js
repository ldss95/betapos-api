"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const MySqlStore = require('express-mysql-session')(express_session_1.default);
const path_1 = __importDefault(require("path"));
require("dotenv/config");
const routes_1 = __importDefault(require("./routes/routes"));
const server = express_1.default();
server.set('port', process.env.PORT || 3000);
const sessionStore = new MySqlStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306
});
server.use(express_1.default.json());
server.use(express_1.default.urlencoded({ extended: true }));
server.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
server.use(express_session_1.default({
    secret: process.env.SECRET_SESSION || '',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}));
server.use(routes_1.default);
server.listen(server.get('port'));
