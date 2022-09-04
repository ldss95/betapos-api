import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

import { userSchema, businessSchema } from './schema'

export function validLogin(req: Request, res: Response, next: NextFunction): Response | void {
	const { email, password } = req.body

	if (!email) {
		return res.status(400).send({
			message: 'Missin property `email`'
		})
	}

	if (!password) {
		return res.status(400).send({
			message: 'Missin property `password`'
		})
	}

	next()
}

export function validChangePassword(req: Request, res: Response, next: NextFunction): Response | void {
	const { oldPassword, newPassword } = req.body

	if (!oldPassword) {
		return res.status(400).send({
			message: 'Missin property `oldPassword`'
		})
	}

	if (!newPassword) {
		return res.status(400).send({
			message: 'Missin property `newPassword`'
		})
	}

	next()
}

export function validSignup(req: Request, res: Response, next: NextFunction): Response | void {
	try {
		const { user, business } = req.body

		if (!user) {
			return res.status(400).send({
				message: 'Missin property `user`'
			})
		}

		if (!business) {
			return res.status(400).send({
				message: 'Missin property `business`'
			})
		}

		userSchema.parse(user)
		businessSchema.parse(business)

		next()
	} catch (error) {
		if (error instanceof ZodError) {
			return res.status(400).send({
				errors: error.issues,
				message: 'Algo salió mal'
			})
		}
	}
}
