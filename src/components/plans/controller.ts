import { NextFunction, Request, Response } from 'express'

import { getPlans } from './services'

export default {
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const plans = await getPlans()
			res.status(200).send(plans)
		} catch (error) {
			res.status(500).send(error)
			next(error)
		}
	}
}
