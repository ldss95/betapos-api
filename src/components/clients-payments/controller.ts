import { Request, Response } from 'express'

import { ClientPayment } from './model'

export default {
	create: async (req: Request, res: Response) => {
		const { clientId, amount, description } = req.body
		const { userId } = req.session!

		const payment = await ClientPayment.create({
			userId,
			clientId,
			amount,
			description
		})

		res.status(201).send(payment.toJSON())
	}
}
