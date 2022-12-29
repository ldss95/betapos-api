import { NextFunction, Request, Response } from 'express'

import { Coupon } from './model'

export default {
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId } = req.session!
			const coupon = {
				...req.body,
				businessId
			}

			const { id } = await Coupon.create(coupon)
			res.status(201).send({ id })
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.body

			await Coupon.update(req.body, { where: { id } })
			res.sendStatus(200)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	delete: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params

			await Coupon.destroy({ where: { id } })
			res.sendStatus(200)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId } = req.session!

			const coupons = await Coupon.findAll({ where: { businessId } })
			res.status(200).send(coupons)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getOne: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params

			const coupon = await Coupon.findOne({ where: { id } })
			res.status(200).send(coupon?.toJSON())
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
