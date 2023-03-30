import { z } from 'zod'

const CashDetailSchema = z.object({
	type: z.enum(['coin', 'bill']),
	quantity: z.number()
})

export const NewShiftSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	startAmount: z.number(),
	startTime: z.string(),
	endAmount: z.number().nullable().optional(),
	cashDetails: z.array(CashDetailSchema).nullable().optional(),
	endTime: z.string().nullable().optional(),
	date: z.string(),
})

export const UpdateShiftSchema = z.object({
	id: z.string().uuid(),
	endAmount: z.number(),
	cashDetails: z.array(CashDetailSchema).nullable().optional(),
	endTime: z.string(),
	cashIn: z.number(),
	cashOut: z.number(),
	totalSold: z.number()
})
