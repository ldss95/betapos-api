import { Request, Response } from 'express'

import { login as handleLogin, changePassword as handleChangePassword, createAccount } from './services'
import { saveHistory } from '../history/services'
import { Table } from '../history/interface'

export default {
	login: async (req: Request, res: Response) => {
		const { email, password } = req.body
		const agent = req.headers['user-agent']
		const { loggedin, user, token, expireSoon } = await handleLogin(email, password)

		if (!loggedin || !user) {
			return res.status(401).send({
				message: 'Email o contraseña incorrecta.'
			})
		}

		req.session!.loggedin = true
		req.session!.name = `${user?.firstName} ${user?.lastName}`
		req.session!.photo = user?.photoUrl
		req.session!.email = user?.email
		req.session!.roleId = user?.roleId
		req.session!.roleCode = user?.roleCode
		req.session!.businessId = user?.businessId
		req.session!.merchantId = user?.merchantId
		req.session!.userId = user?.id
		await saveHistory({
			after: user,
			ip: req.ip,
			agent,
			table: Table.SESSION,
			userId: user.id,
			identifier: user.id
		})

		res.status(200).send({
			token: token,
			message: 'Sesion iniciada correctamente',
			user,
			expireSoon
		})
	},
	changePassword: async (req: Request, res: Response) => {
		const { oldPassword, newPassword } = req.body
		const { userId, merchantId } = req.session!

		const changed = await handleChangePassword(userId, oldPassword, newPassword, merchantId)
		if (!changed) {
			return res.status(401).send({
				message: 'Contraseña incorrecta.'
			})
		}

		res.sendStatus(204)
	},
	signup: async (req: Request, res: Response) => {
		const { user, business, partnerCode } = req.body
		const { error } = await createAccount(user, business, partnerCode)
		if (error) {
			return res.status(400).send({ message: error })
		}

		res.sendStatus(201)
	},
	logout: (req: Request, res: Response) => {
		req.session?.destroy((error) => {
			if (error) {
				throw error
			}

			res.sendStatus(204)
		})
	},
	getCurrentSession: (req: Request, res: Response) => {
		if (!req.session!.loggedin) {
			return res.status(200).send({ session: null })
		}

		res.status(200).send({ session: req.session })
	}
}
