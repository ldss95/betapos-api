import { Request, Response } from 'express'

import { User } from '../users/model'
import { CashFlow } from './model'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { cashFlow } = req.body

			if (!cashFlow) {
				return res.status(400).send({
					message: 'Missing data'
				})
			}

			const user = await User.findByPk(cashFlow.userId)
			if (!user) {
				throw new Error('Usuario no encontrado')
			}

			const { businessId } = user

			await CashFlow.create({
				...cashFlow,
				businessId
			})
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!
		CashFlow.findAll({
			where: { businessId }
		})
			.then((cashFlows) => res.status(200).send(cashFlows))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
