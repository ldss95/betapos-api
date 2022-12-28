import { Request, Response } from 'express'

import { getPlans } from './services'

export default {
	getAll: async (req: Request, res: Response) => {
		try {
			const plans = await getPlans()
			res.status(200).send(plans)
		} catch (error) {
			res.status(500).send(error)
			throw error
		}
	}
}
