import { z } from 'zod'

const BarcodeSchema = z.object({
	barcode: z.string().min(3)
})

export const ProductSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().min(1),
	categoryId: z.string().uuid().nullable().optional(),
	barcodes: z.array(BarcodeSchema).optional(),
	referenceCode: z
		.string()
		.nullable()
		.optional()
		.refine((val) => {
			if (!val) {
				return true
			}

			return val?.replace(/ /g, '') === '' || (val?.length || 0) >= 3
		}, { message: 'Código de referencia muy corto' }),
	initialStock: z.number().optional(),
	cost: z.number().nullable().optional(),
	price: z.number().nullable().optional(),
	businessPrice: z.number().min(0).nullable().optional(),
	itbis: z.boolean(),
	isFractionable: z.boolean().optional(),
})
