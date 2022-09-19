import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

const TableRequestSchema = z.object({
	page: z.number().min(1),
	limit: z.number(),
	filters: z.object({
		isActive: z.array(z.boolean()).nullable(),
		category: z.array(z.string()).nullable(),
		brand: z.array(z.string()).nullable()
	}).optional(),
	sorter: z.array(z.string()).nullable().optional()
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
