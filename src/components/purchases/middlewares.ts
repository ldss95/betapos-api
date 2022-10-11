import { NextFunction, Request, Response } from 'express'
import { z, ZodError } from 'zod'

const newPurchaseSchecema = z.object({
	providerId: z.string(),
	documentId: z.string(),
	paymentType: z.enum(['IMMEDIATE', 'CREDIT']),
	affectsExistence: z.boolean(),
	fileUrl: z.string().optional(),
	amount: z.number().min(1),
	date: z.string(),
	adjustPrices: z.boolean()
})

export function validateNewPurchase(req: Request, res: Response, next: NextFunction): Response | void {
	try {
		newPurchaseSchecema.parse(req.body)
		next()
	} catch (error) {
		if (error instanceof ZodError) {
			return res.status(400).send({
				errors: error.issues,
				message: 'Informacion incompleta o incorrecta'
			})
		}
	}
}

const updatePurchaseSchema = z.object({
	id: z.string(),
	providerId: z.string(),
	documentId: z.string(),
	paymentType: z.enum(['IMMEDIATE', 'CREDIT']),
	affectsExistence: z.boolean(),
	fileUrl: z.string().optional(),
	amount: z.number().min(1),
	date: z.string(),
	adjustPrices: z.boolean()
})

export function validateUpdatePurchase(req: Request, res: Response, next: NextFunction) {
	try {
		updatePurchaseSchema.parse(req.body)
		next()
	} catch (error) {
		if (error instanceof ZodError) {
			return res.status(400).send({
				errors: error.issues,
				message: 'Informacion incompleta o incorrecta'
			})
		}
	}
}
