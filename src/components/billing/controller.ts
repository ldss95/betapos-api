import { Request, Response } from 'express'

import { listAllInvoices, markInvoiceAsPayed } from './service'

export default {
	getAll: async (req: Request, res: Response) => {
		try {
			const { roleCode, businessId, id } = req.session!
			const invoices = await listAllInvoices(roleCode, businessId, id)

			res.status(200).send(invoices)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	markAsPayed: async (req: Request, res: Response) => {
		try {
			const { id, date } = req.body
			const file = req.file as Express.MulterS3.File
			await markInvoiceAsPayed(id, date, file?.location)

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
