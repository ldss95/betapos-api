import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import { TicketSchema } from './schema'

export async function validateInsertSale(req: Request, res: Response, next: NextFunction) {
	try {
		if (!req.body.ticket) {
			return res.status(400).send({
				message: 'Missing property `ticket`'
			})
		}

		TicketSchema.parse(req.body.ticket)
		next()
	} catch (error) {
		const err = error as ZodError
		res.status(400).send(err.errors)
	}
}
