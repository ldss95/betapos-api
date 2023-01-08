import { NextFunction, Request, Response } from 'express'
import { ForeignKeyConstraintError, Op, UniqueConstraintError } from 'sequelize'

import { Shift } from '../shifts/model'
import { User } from '../users/model'
import { CashFlow } from './model'

export default {
	create: async (req: Request, res: Response, next: NextFunction) => {
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

			res.sendStatus(201)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return res.sendStatus(201)
			}

			if (error instanceof ForeignKeyConstraintError) {
				return res.status(400).send({
					message: 'El turno al que pertenece esta transaccion aun no ha sido registrado en el servidor'
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId } = req.session!
			const { shiftId } = req.query

			const data = await CashFlow.findAll({
				where: {
					[Op.and]: [
						{
							...(shiftId && {
								shiftId
							})
						},
						{ businessId }
					]
				},
				include: {
					model: Shift,
					as: 'shift',
					include: [
						{
							model: User,
							as: 'user',
							paranoid: false
						}
					]
				}
			})

			res.status(200).send(data.map((item) => item.toJSON()))
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
