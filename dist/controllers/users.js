"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_connection_1 = __importDefault(require("../lib/mysql_connection"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.default = {
    getOne: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const query = `SELECT
                    id,
                    nombres,
                    apellidos,
                    foto,
                    email,
                    telefono,
                    direccion,
                    estado,
                    rol,
                    empresa,
                    sucursal
                FROM
                    usuarios
                WHERE
                    id = ?`;
            const [row, fields] = yield mysql_connection_1.default.query(query, [id]);
            res.status(200).send(row);
        }
        catch (error) {
            res.status(500).send(error.sqlMessage);
            throw error;
        }
    }),
    getAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const query = `SELECT
                    id,
                    firstName,
                    lastName,
                    photo,
                    email,
                    phone,
                    address,
                    status,
                    role,
                    business,
                    branch
                FROM
                    users`;
            const [rows, fields] = yield mysql_connection_1.default.query(query);
            res.status(200).send(rows);
        }
        catch (error) {
            res.status(500).send(error.sqlMessage);
            throw error;
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    }),
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.body;
            user.password = bcrypt_1.default.hashSync(user.password, 13);
            const query = `INSERT INTO
                    users
                SET ?`;
            const [results, fields] = yield mysql_connection_1.default.query(query, user);
            res.status(201).send({ id: results.insertId });
        }
        catch (error) {
            if (error.message == 'data and salt arguments required')
                res.sendStatus(400);
            else if (error.errno == 1062)
                res.status(409).send('El email ingresado ya esta en uso');
            else
                res.sendStatus(500);
            throw error;
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const email = req.body.email;
            const [row, fields] = yield mysql_connection_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
            if (row.length == 1) {
                const user = row[0];
                if (bcrypt_1.default.compareSync(req.body.password, user.password)) {
                    req.session.loggedin = true;
                    req.session.name = `${user.firstName} ${user.lastName}`;
                    req.session.photo = user.photo;
                    req.session.email = user.email;
                    req.session.role = user.role;
                    let data = {
                        iss: 'Zeconomy-BackEnd',
                        aud: 'web',
                        iat: (new Date().getTime() / 1000),
                        user: {
                            id: user.id,
                            name: req.session.name,
                            email: user.email,
                            createdAt: user.createdAt
                        }
                    };
                    const token = jsonwebtoken_1.default.sign(data, process.env.SECRET_TOKEN || '', { expiresIn: '24h' });
                    res.status(200).send({
                        token: token,
                        message: 'Sesion iniciada correctamente'
                    });
                }
                else
                    res.status(200).send('Contraseña incorrecta.');
            }
            else {
                res.status(200).send('El usuario ingresao no existe.');
            }
        }
        catch (error) {
            res.status(500).send(error.sqlMessage);
            throw error;
        }
    })
};
