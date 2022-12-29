import { NextFunction, Request, Response } from 'express'

import { notifyUpdate } from '../../helpers'
import { Business } from '../business/model'
import { Setting } from './model'

export default {
	get: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId } = req.session!
			const settings = await Setting.findOne({
				where: {
					businessId
				}
			})

			res.status(200).send(settings?.toJSON())
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId, merchantId } = req.session!

			await Setting.update(req.body, {
				where: {
					businessId
				}
			})
			notifyUpdate('settings', merchantId)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getUpdates: async (req: Request, res: Response, next: NextFunction) => {
		try {
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
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
