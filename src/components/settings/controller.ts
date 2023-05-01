import { Request, Response } from 'express'

import { notifyUpdate } from '../../helpers'
import { Business } from '../business/model'
import { Setting } from './model'

export default {
	get: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const settings = await Setting.findOne({
			where: {
				businessId
			}
		})

		res.status(200).send(settings?.toJSON())
	},
	update: async (req: Request, res: Response) => {
		const { businessId, merchantId } = req.session!

		await Setting.update(req.body, {
			where: {
				businessId
			}
		})
		notifyUpdate('settings', merchantId)
		res.sendStatus(204)
	},
	getUpdates: async (req: Request, res: Response) => {
		const merchantId = req.header('merchantId')
		const business = await Business.findOne({
			where: {
				merchantId
			}
		})

		if (!business || !business.isActive) {
			return res.sendStatus(400)
		}

		const settings = await Setting.findOne({
			where: {
				businessId: business.id
			}
		})

		res.status(200).send(settings?.toJSON())
	}
}
