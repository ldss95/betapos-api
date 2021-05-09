import { Request, Response } from 'express';

import { Coupon } from './model';

export default {
	create: (req: Request, res: Response) => {
		const { businessId } = req.session!
		const coupon = {
			...req.body,
			businessId
		}

		Coupon.create(coupon)
			.then(coupon => res.status(201).send({ id: coupon.id }))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Coupon.update(req.body, { where: { id }})
			.then(() => res.sendStatus(200))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params;

		Coupon.destroy({ where: { id } })
			.then(() => res.sendStatus(200))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!

		Coupon.findAll({ where: { businessId }})
			.then(coupons => res.status(200).send(coupons))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params;

		Coupon.findOne({ where: { id } })
			.then(coupon => res.status(200).send(coupon))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
}
