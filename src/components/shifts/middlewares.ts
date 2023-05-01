import { Request, Response, NextFunction } from 'express'

import { NewShiftSchema, UpdateShiftSchema } from './schema'

export function validateInsertShift(req: Request, res: Response, next: NextFunction) {
	if (!req.body.shift) {
		return res.status(400).send({
			message: 'Missing property `shift`'
		})
	}

	NewShiftSchema.parse(req.body.shift)
	next()
}

export function validateUpdateShift(req: Request, res: Response, next: NextFunction) {
	if (!req.body.shift) {
		return res.status(400).send({
			message: 'Missing property `shift`'
		})
	}

	UpdateShiftSchema.parse(req.body.shift)
	next()
}
