import { Request, Response } from 'express'

import { CashFlow } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!
		CashFlow.findAll({
			where: { businessId }
		})
			.then((cashFlows) => res.status(200).send(cashFlows))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
