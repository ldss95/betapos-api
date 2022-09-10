import { NextFunction, Request, Response } from 'express'

export function validateCreateBrand(req: Request, res: Response, next: NextFunction): Response | void {
	const { name } = req.body

	if (!name) {
		return res.status(400).send({
			message: 'Missing property `name`'
		})
	}

	next()
}

export function validateUpdateBrand(req: Request, res: Response, next: NextFunction): Response | void {
	const { name, id } = req.body

	if (!name) {
		return res.status(400).send({
			message: 'Missing property `name`'
		})
	}

	if (!id) {
		return res.status(400).send({
			message: 'Missing property `id`'
		})
	}

	next()
}
