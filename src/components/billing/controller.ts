import { Request, Response } from 'express'
import moment from 'moment'

import { listAllInvoices, markInvoiceAsPayed } from './service'

export default {
	getAll: async (req: Request, res: Response) => {
		const { roleCode, businessId, id } = req.session!
		const invoices = await listAllInvoices(roleCode, businessId, id)

		res.status(200).send(invoices)
	},
	markAsPayed: async (req: Request, res: Response) => {
		const { id, date } = req.body
		const file = req.file as Express.MulterS3.File
		await markInvoiceAsPayed(id, date, file?.location)

		res.sendStatus(204)
	},
	payedWithStripe: async (req: Request, res: Response) => {
		const { data } = req.body
		await markInvoiceAsPayed(
			data.object.metadata.billId,
			moment().format('YYYY-MM-DD')
		)
		res.sendStatus(204)
	}
}
