import { Request, Response } from 'express'
import mysql from '../lib/mysql_connection'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default {
    getOne: async (req: Request, res: Response) => {
        try {
            const id = req.params.id
            const query =
                `SELECT
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
                    users`

            const [rows, fields] = await mysql.query(query)
            res.status(200).send(rows)
        } catch (error) {
            res.status(500).send(error.sqlMessage)
            throw error
        }
    },
    update: async (req: Request, res: Response) => {

    },
    delete: async (req: Request, res: Response) => {

    },
    create: async (req: Request, res: Response) => {
        try {
            const user = req.body
            user.password = bcrypt.hashSync(user.password, 13)

            const query =
                `INSERT INTO
                    users
                SET ?`

            const [results, fields] = await mysql.query(query, user)
            res.status(201).send({ id: results.insertId })
        } catch (error) {
            if (error.message == 'data and salt arguments required')
                res.sendStatus(400)
            else if(error.errno == 1062)
                res.status(409).send('El email ingresado ya esta en uso')
            else
                res.sendStatus(500)

            throw error
        }
    },
    login: async (req: Request, res: Response) => {
        try {
            const email = req.body.email
            const [row, fields] = await mysql.query('SELECT * FROM users WHERE email = ?', [email])
            if (row.length == 1) {
                const user = row[0]
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    req.session!.loggedin = true
                    req.session!.name = `${user.firstName} ${user.lastName}`
                    req.session!.photo = user.photo
                    req.session!.email = user.email
                    req.session!.role = user.role

                    let data = {
                        iss: 'Zeconomy-BackEnd',
                        aud: 'web',
                        iat: (new Date().getTime() / 1000),
                        user: {
                            id: user.id,
                            name: req.session!.name,
                            email: user.email,
                            createdAt: user.createdAt
                        }
                    }

                    const token = jwt.sign(data, process.env.SECRET_TOKEN || '', { expiresIn: '24h' })

                    res.status(200).send({
                        token: token,
                        message: 'Sesion iniciada correctamente'
                    })
                } else
                    res.status(200).send('Contraseña incorrecta.')
            } else {
                res.status(200).send('El usuario ingresao no existe.')
            }
        } catch (error) {
            res.status(500).send(error.sqlMessage)
            throw error
        }
    }
}