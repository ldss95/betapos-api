import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { User } from '../users/model'

export default {
	login: async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body

			const user = await User.findOne({ where: { email } })

			if (!user) {
				res.status(401).send({
					message: 'Email incorrecto.'
				})
				return
			}

			const passwordMatch = bcrypt.compareSync(password, user.password)
			if (!passwordMatch) {
				res.status(401).send({
					message: 'Contraseña incorrecta.'
				})
				return
			}

			req.session!.loggedin = true
			req.session!.name = `${user.firstName} ${user.lastName}`
			req.session!.photo = user.photoUrl
			req.session!.email = user.email
			req.session!.roleId = user.roleId
			req.session!.businessId = user.businessId

			const data = {
				iss: 'Zeconomy-API',
				aud: 'web',
				iat: new Date().getTime() / 1000,
				user: {
					id: user.id,
					name: req.session!.name,
					email: user.email,
					createdAt: user.createdAt
				}
			}

			const token = jwt.sign(data, process.env.SECRET_TOKEN || '', {
				expiresIn: '24h'
			})

			res.status(200).send({
				token: token,
				message: 'Sesion iniciada correctamente',
				user: {
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					roleId: user.roleId
				}
			})
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	logout: (req: Request, res: Response) => {
		req.session?.destroy((error) => {
			if (error) {
				res.sendStatus(500)
				throw error
			}

			res.sendStatus(204)
		})
	}
}
