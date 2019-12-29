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
exports.default = {
    getOne: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = +req.params.id;
            const query = `SELECT
                    *
                FROM
                    business
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
                    *
                FROM
                    empresas`;
            const [rows, fields] = yield mysql_connection_1.default.query(query);
            res.status(200).send(rows);
        }
        catch (error) {
            res.status(500).send(error.sqlMessage);
            throw error;
        }
    }),
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = req.body;
            const query = `INSERT INTO
                    empresas
                SET ?`;
            const [results, fields] = yield mysql_connection_1.default.query(query, business);
            res.status(200).send(results.insertId);
        }
        catch (error) {
            if (error.errno == 1062)
                res.status(409).send('El RNC ingresado ya esta en uso');
            else
                res.status(500).send(error.sqlMessage);
            throw error;
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = req.body;
            const query = `UPDATE
                    empresa
                SET
                    nombre = :nombre,
                    rnc = :rnc,
                    email = :email,
                    telefono = :telefono,
                    tipo = :tipo`;
            const [results, fields] = yield mysql_connection_1.default.query(query, business);
            res.status(200).send(results.affectedRows);
        }
        catch (error) {
            res.status(500).send(error.sqlMessage);
            throw error;
        }
    })
};
