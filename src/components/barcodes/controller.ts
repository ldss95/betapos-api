import { Request, Response } from 'express'

import { getUpdates } from './services'

export default {
	getUpdates: async (req: Request, res: Response) => {
		const { date } = req.params
		const merchantId = req.header('merchantId')

		const { updated, created } = await getUpdates(date, merchantId!)

		res.status(200).send({ created, updated })
	}
}
