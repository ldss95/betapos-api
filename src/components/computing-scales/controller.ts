import { Request, Response } from 'express'

import { Business } from '../business/model'
import {
	createComputingScale,
	deleteComputingScale,
	getAllComputingScale,
	getComputingScalesUpdates,
	updateComputingScale
} from './services'

export default {
	create: async (req: Request, res: Response) => {
		const { businessId, merchantId } = req.session!
		await createComputingScale({ ...req.body, businessId }, merchantId)
		res.sendStatus(201)
	},
	update: async (req: Request, res: Response) => {
		const { id, ...scale } = req.body
		const { merchantId } = req.session!

		await updateComputingScale(id, scale, merchantId)
		res.sendStatus(204)
	},
	delete: async (req: Request, res: Response) => {
		const { id } = req.params
		const { merchantId } = req.session!

		await deleteComputingScale(id, merchantId)
		res.sendStatus(204)
	},
	getAll: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const scales = await getAllComputingScale(businessId)
		res.status(200).send(scales)
	},
	getUpdates: async (req: Request, res: Response) => {
		const { date } = req.params
		const merchantId = req.header('merchantId')

		const business = await Business.findOne({
			where: {
				merchantId
			}
		})

		if (!business || !business.isActive) {
			return res.sendStatus(400)
		}

		const results = await getComputingScalesUpdates(business.id, date)

		res.status(200).send(results)
	},
}
