import { Request, Response } from 'express'

import { getPlans } from './services'

export default {
	getAll: async (req: Request, res: Response) => {
		const plans = await getPlans()
		res.status(200).send(plans)
	}
}
