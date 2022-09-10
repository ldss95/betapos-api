import { Request, Response } from 'express'
import { Business } from '../business/model'

import { getUpdates } from './services'

export default {
	getUpdates: async (req: Request, res: Response) => {
		try {
			const { date } = req.params
			const merchantId = req.header('merchantId')

			const business = await Business.findOne({
				where: {
					merchantId
				}
			})

			if (!business || !business.isActive) {
				return res.status(400).send({
					message: 'Cliente desabilitado'
				})
			}

			const { updated, created } = await getUpdates(date, business.id)

			res.status(200).send({ created, updated })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
