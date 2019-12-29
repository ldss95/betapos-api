import { Request, Response } from 'express'
import mysql from '../lib/mysql_connection'

export default {
    getOne: async (req: Request, res: Response) => {
        try {
            const id: number = +req.params.id
            const query =
                `SELECT
                    *
                FROM
                    business
                WHERE
                    id = ?`

            const [row, fields] = await mysql.query(query, [id])
            res.status(200).send(row)
        } catch (error) {
            res.status(500).send(error.sqlMessage)
            throw error
        }
    },
    getAll: async (req: Request, res: Response) => {
        try {
            const query =
                `SELECT
                    *
                FROM
                    empresas`

            const [rows, fields] = await mysql.query(query)
            res.status(200).send(rows)
        } catch (error) {
            res.status(500).send(error.sqlMessage)
            throw error
        }
    },
    create: async (req: Request, res: Response) => {
        try {
            const business = req.body
            const query =
                `INSERT INTO
                    empresas
                SET ?`
        
            const [results, fields] = await mysql.query(query, business)
            res.status(200).send(results.insertId)
        } catch (error) {
            if(error.errno == 1062)
                res.status(409).send('El RNC ingresado ya esta en uso')
            else
                res.status(500).send(error.sqlMessage)

            throw error
        }
    },
    update: async (req: Request, res: Response) => {
        try {
            const business = req.body
            const query =
                `UPDATE
                    empresa
                SET
                    nombre = :nombre,
                    rnc = :rnc,
                    email = :email,
                    telefono = :telefono,
                    tipo = :tipo`
        
            const [results, fields] = await mysql.query(query, business)
            res.status(200).send(results.affectedRows)
        } catch (error) {
            res.status(500).send(error.sqlMessage)
            throw error
        }
    }
}