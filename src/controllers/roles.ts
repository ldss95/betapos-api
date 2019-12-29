import mysql from '../lib/mysql_connection' 
import { Request, Response } from 'express'

export default {
    getAll: async (req: Request, res: Response) => {
        try {
            const query =
                `SELECT
                    *
                FROM
                    roles`

            const [row, fields] = await mysql.query(query)
            res.status(200).send(row)
        } catch (error) {
            res.status(500).send(error.sqlMessage)
            throw error
        }
    },
    getOne: async (req: Request, res: Response) => {
        try {
            const id: number = +req.params.id
            const query =
                `SELECT
                    *
                FROM
                    roles
                WHERE
                    id = ?`

            const [rows, fields] = await mysql.query(query, [id])
            res.status(200).send(rows)
        } catch (error) {
            res.status(500).send(error.sqlMessage)
            throw error  
        }
    },
    create: async (req: Request, res: Response) => {
        try {
            const role = req.body
            const query =
                `INSERT INTO
                    roles
                SET ?`

            const [results, fielsd] = await mysql.query(query, role)
            res.status(200).send(results.insertId)
        } catch (error) {
            res.status(500).send(error.sqlMessage)
            throw error
        }
    },
    update: async (req: Request, res: Response) => {

    },
    delete: async (req: Request, res: Response) => {
        
    }
}