import { Request, Response, NextFunction } from 'express'
import { ZodError, z } from 'zod'

const newComputingScaleSchema = z.object({
	name: z.string(),
	prefix: z.string(),
	barcodeLength: z.number(),
	decimalsWight: z.number()
})

export function validateNewComputingScale(req: Request, res: Response, next: NextFunction): Response | void {
	try {
		newComputingScaleSchema.parse(req.body)
		next()
	} catch (error) {
		if (error instanceof ZodError) {
			res.status(400).send({
				errors: error.issues,
				message: 'Informacion incompleta o incorrecta'
			})
		}
	}
}

const updateComputingScaleSchema = z.object({
	id: z.string(),
	name: z.string(),
	prefix: z.string(),
	barcodeLength: z.number(),
	decimalsWight: z.number()
})

export function validateUpdateComputingScale(req: Request, res: Response, next: NextFunction): Response | void {
	try {
		updateComputingScaleSchema.parse(req.body)
		next()
	} catch (error) {
		if (error instanceof ZodError) {
			res.status(400).send({
				errors: error.issues,
				message: 'Informacion incompleta o incorrecta'
			})
		}
	}
}
