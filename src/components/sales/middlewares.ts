import { NextFunction, Request, Response } from 'express'

import { TicketSchema } from './schema'

export async function validateInsertSale(req: Request, res: Response, next: NextFunction) {
	if (!req.body.ticket) {
		return res.status(400).send({
			message: 'Missing property `ticket`'
		})
	}

	TicketSchema.parse(req.body.ticket)
	next()
}
