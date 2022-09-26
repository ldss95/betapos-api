import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

export function validateCreateProduct(req: Request, res: Response, next: NextFunction) {
	try {
		const { cost, price } = req.body
		if (+cost && +price && +cost > +price) {
			return res.status(400).send({
				message: 'El costo no puede ser mayor al precio'
			})
		}

		next()
	} catch (error) {
		if (error instanceof ZodError) {
			res.status(400).send({
				message: 'Solicitud mal formada',
				errors: error.issues
			})
		}
	}
}

const TableRequestSchema = z.object({
	page: z.number().min(1),
	limit: z.number(),
	filters: z
		.object({
			isActive: z.array(z.boolean()).nullable(),
			category: z.array(z.string()).nullable(),
			brand: z.array(z.string()).nullable()
		})
		.optional(),
	sorter: z.string().nullable().array().optional()
})

export function validateTableRequest(req: Request, res: Response, next: NextFunction): Response | void {
	try {
		TableRequestSchema.parse(req.body)
		next()
	} catch (error) {
		if (error instanceof ZodError) {
			res.status(400).send({
				message: 'Solicitud mal formada',
				errors: error.issues
			})
		}
	}
}
