import { NextFunction, Request, Response } from 'express'
import { UniqueConstraintError } from 'sequelize'
import { z} from 'zod'

export function validateNewPurchase(req: Request, res: Response, next: NextFunction): Response | void {
	const newPurchaseSchema = z.object({
		providerId: z.string(),
		documentId: z.string(),
		paymentType: z.enum(['IMMEDIATE', 'CREDIT']),
		affectsExistence: z.boolean(),
		fileUrl: z.string().optional(),
		amount: z.number().min(1),
		date: z.string(),
		adjustPrices: z.boolean(),
		ncf: z.string().length(11).optional().nullable()
	})

	newPurchaseSchema.parse(req.body)
	next()
}

export function validateUpdatePurchase(req: Request, res: Response, next: NextFunction): Response | void {
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

	updatePurchaseSchema.parse(req.body)
	next()
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

export function validateUpdateProductQty(req: Request, res: Response, next: NextFunction): Response | void {
	const updateProductQtySchema = z.object({
		id: z.string(),
		quantity: z.number().min(1, 'La cantidad minima debe ser 1'),
	})

	updateProductQtySchema.parse(req.body)
	next()
}

export function validateUpdateProductCost(req: Request, res: Response, next: NextFunction): Response | void {
	const updateProductCostSchema = z.object({
		id: z.string(),
		cost: z.number().min(0.01, 'El costo minimo debe ser 0.01'),
	})

	updateProductCostSchema.parse(req.body)
	next()
}

export function validateUpdateProductPrice(req: Request, res: Response, next: NextFunction): Response | void {
	const updateProductPriceSchema = z.object({
		id: z.string(),
		price: z.number().min(0.01, 'El precio0 minimo debe ser 0.01'),
	})

	updateProductPriceSchema.parse(req.body)
	next()
}

export function handleCreateError(error: unknown, req: Request, res: Response, next: NextFunction) {
	if (error instanceof UniqueConstraintError) {
		return res.status(400).json({
			errors: [{ name: 'Factura Duplicada' }],
			message: 'Esta factura ya fue registrada anteriormente'
		})
	}

	next(error)
}
