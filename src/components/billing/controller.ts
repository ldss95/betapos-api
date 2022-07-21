import { Request, Response } from 'express'

import { Bill } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		const { roleCode, businessId } = req.session!
		Bill.findAll({
			where: {
				...(roleCode == 'BIOWNER' && {
					businessId
				})
			},
			order: [['createdAt', 'DESC']]
		})
			.then((bills) => res.status(200).send(bills))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
