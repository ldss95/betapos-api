import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export function validateNewComputingScale(req: Request, res: Response, next: NextFunction): Response | void {
	const newComputingScaleSchema = z.object({
		name: z.string(),
		prefix: z.string(),
		barcodeLength: z.number(),
		decimalsWight: z.number()
	})

	newComputingScaleSchema.parse(req.body)
	next()
}

export function validateUpdateComputingScale(req: Request, res: Response, next: NextFunction): Response | void {
	const updateComputingScaleSchema = z.object({
		id: z.string(),
		name: z.string(),
		prefix: z.string(),
		barcodeLength: z.number(),
		decimalsWight: z.number()
	})

	updateComputingScaleSchema.parse(req.body)
	next()
}
