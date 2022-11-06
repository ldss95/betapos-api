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

export function validateUpdatePurchase(req: Request, res: Response, next: NextFunction): Response | void {
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

export function validateAttachFile(req: Request, res: Response, next: NextFunction): Response | void {
	const file = req.file as Express.MulterS3.File

	if (!file || !file?.location) {
		return res.status(400).send({
			message: 'No attached or invalid file'
		})
	}

	next()
}

const updateProductQtySchema = z.object({
	id: z.string(),
	quantity: z.number().min(1, 'La cantidad minima debe ser 1'),
})
export function validateUpdateProductQty(req: Request, res: Response, next: NextFunction): Response | void {
	try {
		updateProductQtySchema.parse(req.body)
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

const updateProductCostSchema = z.object({
	id: z.string(),
	cost: z.number().min(0.01, 'El costo minimo debe ser 0.01'),
})
export function validateUpdateProductCost(req: Request, res: Response, next: NextFunction): Response | void {
	try {
		updateProductCostSchema.parse(req.body)
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

const updateProductPriceSchema = z.object({
	id: z.string(),
	price: z.number().min(0.01, 'El precio0 minimo debe ser 0.01'),
})
export function validateUpdateProductPrice(req: Request, res: Response, next: NextFunction): Response | void {
	try {
		updateProductPriceSchema.parse(req.body)
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
