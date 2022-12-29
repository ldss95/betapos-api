import { NextFunction, Request, Response } from 'express'
import { CustomError } from '../../errors'

import { getUpdates } from './services'

export default {
	getUpdates: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { date } = req.params
			const merchantId = req.header('merchantId')

			const { updated, created } = await getUpdates(date, merchantId!)

			res.status(200).send({ created, updated })
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(400).send(error.message)
			}

			res.sendStatus(500)
			next(error)
		}
	}
}
