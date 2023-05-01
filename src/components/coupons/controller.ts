import { Request, Response } from 'express'

import { Coupon } from './model'

export default {
	create: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const coupon = {
			...req.body,
			businessId
		}

		const { id } = await Coupon.create(coupon)
		res.status(201).send({ id })
	},
	update: async (req: Request, res: Response) => {
		const { id } = req.body

		await Coupon.update(req.body, { where: { id } })
		res.sendStatus(200)
	},
	delete: async (req: Request, res: Response) => {
		const { id } = req.params

		await Coupon.destroy({ where: { id } })
		res.sendStatus(200)
	},
	getAll: async (req: Request, res: Response) => {
		const { businessId } = req.session!

		const coupons = await Coupon.findAll({ where: { businessId } })
		res.status(200).send(coupons)
	},
	getOne: async (req: Request, res: Response) => {
		const { id } = req.params

		const coupon = await Coupon.findOne({ where: { id } })
		res.status(200).send(coupon?.toJSON())
	}
}
