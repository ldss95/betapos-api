import { z } from 'zod'

const PaymentSchema = z.object({
	id: z.string().uuid(),
	ticketId: z.string().uuid(),
	typeId: z.string().uuid(),
	amount: z.number(),
	createdAt: z.string(),
	updatedAt: z.string()
})

const ProductSchema = z.object({
	id: z.string().uuid(),
	ticketId: z.string().uuid(),
	productId: z.string().uuid(),
	quantity: z.number(),
	cost: z.number(),
	price: z.number()
})

export const TicketSchema = z.object({
	id: z.string().uuid(),
	ticketNumber: z.string(),
	ncfTypeId: z.string().nullable().optional(),
	ncfNumber: z.number().nullable().optional(),
	rnc: z.string().max(11).nullable().optional(),
	businessName: z.string().nullable().optional(),
	clientId: z.string().nullable().optional(),
	userId: z.string().uuid(),
	products: z.array(ProductSchema).min(1),
	amount: z.number(),
	discount: z.number().nullable().optional(),
	shiftId: z.string().uuid(),
	orderType: z.enum(['DELIVERY', 'PICKUP']),
	paymentTypeId: z.string().uuid(),
	payments: z.array(PaymentSchema).min(1),
	shippingAddress: z.string().min(1).nullable(),
	status: z.enum(['DONE', 'CANCELLED', 'MODIFIED']),
	cashReceived: z.number().nullable().optional(),
	createdAt: z.string(),
	updatedAt: z.string()
})

