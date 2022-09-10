import { Request, Response, NextFunction } from 'express'

export function validateGetUpdates(req: Request, res: Response, next: NextFunction): Response | void {
	const merchantId = req.header('merchantId')
	if (!merchantId) {
		return res.status(400).send({
			message: 'Missing header `merchantId`'
		})
	}

	next()
}
