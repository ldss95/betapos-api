import { Request, Response } from 'express'

import { Business } from '../business/model'
import { Bill } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		const { roleCode, businessId, id } = req.session!

		Bill.findAll({
			include: {
				model: Business,
				as: 'business',
				required: true,
				where: {
					...(roleCode == 'PARTNER' && {
						referredBy: id
					})
				}
			},
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
	},
	markAsPayed: async (req: any, res: Response) => {
		try {
			let location = req?.file?.location
			if (location && location.substr(0, 8) != 'https://') {
				location = `https://${location}`
			}

			const { id, date } = req.body
			await Bill.update(
				{
					payed: true,
					payedAt: date,
					...(location && {
						transferVoucherUrl: location
					})
				},
				{
					where: { id }
				}
			)

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
