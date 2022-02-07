import { Request, Response } from 'express'
import { Business } from '../business/model'

import { Os } from '../operative-systems/model'
import { Device } from './model'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { merchantId } = req.body

			const business = await Business.findOne({ where: { merchantId } })
			if (!business) {
				return res.status(400).send({
					message: 'MerchantID invalido'
				})
			}

			await Device.create({ ...req.body, businessId: business.id })
			res.sendStatus(201)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Device.update(req.body, { where: { id } })
			.then(() => res.sendStatus(200))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params

		Device.destroy({ where: { id } })
			.then(() => res.sendStatus(200))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!

		Device.findAll({
			where: { businessId },
			include: {
				model: Os,
				as: 'os'
			}
		})
			.then((devices) => res.status(200).send(devices))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
