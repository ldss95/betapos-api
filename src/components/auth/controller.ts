import { Request, Response } from 'express'
import { UniqueConstraintError } from 'sequelize'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import moment from 'moment'

import { db } from '../../database/connection'
import { db as firebase } from '../../database/firebase'
import { User } from '../users/model'
import { Business } from '../business/model'
import { generateMerchantId } from '../business/controller'
import { Role } from '../roles/model'

export default {
	login: async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body

			const user = await User.findOne({
				where: { email },
				include: [
					{
						model: Business,
						as: 'business'
					},
					{
						model: Role,
						as: 'role'
					}
				]
			})

			if (!user) {
				return res.status(401).send({
					message: 'Email o contraseña incorrecta.'
				})
			}

			const passwordMatch = bcrypt.compareSync(password, user.password)
			if (!passwordMatch) {
				return res.status(401).send({
					message: 'Email o contraseña incorrecta.'
				})
			}

			if (user.role.code == 'SELLER') {
				return res.status(401).send({
					message: 'Email o contraseña incorrecta.'
				})
			}

			req.session!.loggedin = true
			req.session!.name = `${user.firstName} ${user.lastName}`
			req.session!.photo = user.photoUrl
			req.session!.email = user.email
			req.session!.roleId = user.roleId
			req.session!.roleCode = user.role.code
			req.session!.businessId = user.businessId
			req.session!.merchantId = user?.business?.merchantId
			req.session!.userId = user.id

			const data = {
				iss: 'Beta-POS-API',
				aud: 'web',
				iat: new Date().getTime() / 1000,
				user: {
					id: user.id,
					name: req.session!.name,
					email: user.email,
					roleCode: user.role.code,
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
					roleId: user.roleId,
					id: user.id,
					businessId: user.businessId,
					photoUrl: user.photoUrl,
					roleCode: user.role.code
				}
			})
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	changePassword: async (req: Request, res: Response) => {
		try {
			const { oldPassword, newPassword } = req.body
			const { userId } = req.session!

			const user = await User.findOne({ where: { id: userId } })
			const passwordMatch = bcrypt.compareSync(oldPassword, user!.password)
			if (!passwordMatch) {
				res.status(401).send({
					message: 'Contraseña incorrecta.'
				})
				return
			}

			user?.update({ password: newPassword })

			const { merchantId } = req.session!
			if (merchantId) {
				await firebase
					.collection(merchantId)
					.doc('users')
					.update({
						lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
					})
			}
	
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	signup: async (req: Request, res: Response) => {
		const transaction = await db.transaction()

		try {
			const { user, business } = req.body

			const merchantId = await generateMerchantId()
			const role = await Role.findOne({ where: { code: 'BIOWNER' } })

			const { id } = await Business.create({ ...business, merchantId }, { transaction })
			const password = bcrypt.hashSync(user.password, 13)
			await User.create(
				{
					...user,
					password,
					businessId: id,
					roleId: role?.id
				},
				{
					transaction
				}
			)
			await transaction.commit()
			res.sendStatus(201)
		} catch (error) {
			await transaction.rollback()

			if (error instanceof UniqueConstraintError) {
				return res.status(400).send({
					message: ''
				})
			}

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
