import { Request, Response } from 'express'
import moment from 'moment'

import { db } from '../../database/firebase'
import { notifyUpdate } from '../../helpers'
import { Business } from '../business/model'
import { Setting } from './model'

export default {
	get: async (req: Request, res: Response) => {
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
			throw error
		}
	},
	update: async (req: Request, res: Response) => {
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
			throw error
		}
	},
	getUpdates: async (req: Request, res: Response) => {
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
			throw error
		}
	}
}
