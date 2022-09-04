import { Request, Response } from 'express'

import { getUpdates } from './services'

export default {
	getUpdates: async (req: Request, res: Response) => {
		try {
			const { date } = req.params
			const merchantId = req.header('merchantId')
			const { error, updated, created } = await getUpdates(date, merchantId!)

			if (error) {
				return res.status(400).send({
					message: error
				})
			}

			res.status(200).send({ created, updated })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
