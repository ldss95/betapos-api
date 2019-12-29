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
    getAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const query = `SELECT
                    *
                FROM
                    roles`;
            const [row, fields] = yield mysql_connection_1.default.query(query);
            res.status(200).send(row);
        }
        catch (error) {
            res.status(500).send(error.sqlMessage);
            throw error;
        }
    }),
    getOne: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = +req.params.id;
            const query = `SELECT
                    *
                FROM
                    roles
                WHERE
                    id = ?`;
            const [rows, fields] = yield mysql_connection_1.default.query(query, [id]);
            res.status(200).send(rows);
        }
        catch (error) {
            res.status(500).send(error.sqlMessage);
            throw error;
        }
    }),
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const role = req.body;
            const query = `INSERT INTO
                    roles
                SET ?`;
            const [results, fielsd] = yield mysql_connection_1.default.query(query, role);
            res.status(200).send(results.insertId);
        }
        catch (error) {
            res.status(500).send(error.sqlMessage);
            throw error;
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    })
};
