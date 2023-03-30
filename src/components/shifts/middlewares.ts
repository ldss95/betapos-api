import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

import { NewShiftSchema, UpdateShiftSchema } from './schema'

export function validateInsertShift(req: Request, res: Response, next: NextFunction) {
	try {
		if (!req.body.shift) {
			return res.status(400).send({
				message: 'Missing property `shift`'
			})
		}

		NewShiftSchema.parse(req.body.shift)
		next()
	} catch (error) {
		const err = error as ZodError
		res.status(400).send(err.errors)
	}
}

export function validateUpdateShift(req: Request, res: Response, next: NextFunction) {
	try {
		if (!req.body.shift) {
			return res.status(400).send({
				message: 'Missing property `shift`'
			})
		}

		UpdateShiftSchema.parse(req.body.shift)
		next()
	} catch (error) {
		const err = error as ZodError
		res.status(400).send(err.errors)
	}
}
