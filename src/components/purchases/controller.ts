import { Request, Response } from 'express'
import { Provider } from '../providers/model'

import { Purchase } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!

		Purchase.findAll({
			where: { businessId },
			include: {
				model: Provider,
				as: 'provider'
			}
		})
			.then((purchases) => res.status(200).send(purchases))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
