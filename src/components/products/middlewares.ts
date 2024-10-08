import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

import { ProductSchema } from './schema'

export function validateProduct(req: Request, res: Response, next: NextFunction) {
	const { cost, price } = req.body
	if (+cost && +price && +cost > +price) {
		return res.status(400).send({
			message: 'El costo no puede ser mayor al precio'
		})
	}

	ProductSchema.parse(req.body)

	next()
}

export function validateTableRequest(req: Request, res: Response, next: NextFunction): Response | void {
	const TableRequestSchema = z.object({
		page: z.number().min(1),
		limit: z.number(),
		filters: z
			.object({
				isActive: z.array(z.boolean()).nullable().optional(),
				category: z.array(z.string()).nullable().optional(),
				brand: z.array(z.string()).nullable().optional()
			})
			.optional(),
		sorter: z.string().nullable().array().optional()
	})

	TableRequestSchema.parse(req.body)
	next()
}

export function transformNumbersPrice(req: Request, _: Response, next: NextFunction) {
	req.body.cost = Number(req.body.cost || 0)
	req.body.price = Number(req.body.price || 0)
	req.body.initialStock = Number(req.body.initialStock || 0)
	req.body.businessPrice = Number(req.body.businessPrice || 0)

	next()
}
