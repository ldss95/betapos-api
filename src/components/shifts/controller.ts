import { Request, Response } from 'express'
import { literal, Op, fn, col } from 'sequelize'

import { Shift } from './model'
import { User } from '../users/model'
import { Sale } from '../sales/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { createShift, updateShift } from './services'
import { CustomError } from '../../errors'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { shift } = req.body
			const deviceId = req.header('deviceId')
			await createShift(shift, deviceId!)
			res.sendStatus(201)
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(error.status).send({
					message: error.message
				})
			}

			res.sendStatus(500)
			throw error
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const { id } = req.body.shift
			const deviceId = req.header('deviceId')
			await updateShift(id, deviceId!, req.body.shift)
			res.sendStatus(204)
		} catch (error) {
			if (error instanceof CustomError) {
				return res.status(error.status).send({
					message: error.message
				})
			}

			res.sendStatus(500)
			throw error
		}
	},
	getAll: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			const { date, userId } = req.query

			const shifts = await Shift.findAll({
				attributes: {
					include: [
						[
							literal('(SELECT SUM(amount) FROM sales WHERE shiftId = shift.id AND status = \'DONE\')'),
							'totalSold'
						],
						[
							literal(`
								(
									SELECT
										SUM(sp.amount)
									FROM
										sales s
									LEFT JOIN
										sales_payments sp ON sp.saleId = s.id
									LEFT JOIN
										sales_payment_types spt ON spt.id = sp.typeId
									WHERE
										shiftId = shift.id AND
										status = 'DONE' AND
										spt.name = 'Efectivo'
								)
							`),
							'totalSoldCash'
						],
						[
							literal(`
								(
									COALESCE((
										SELECT
											SUM(-1 * amount)
										FROM
											cash_flows
										WHERE
											shiftId = shift.id AND
											type = 'OUT'
									), 0) +
									COALESCE((
										SELECT
											SUM(amount)
										FROM
											cash_flows
										WHERE
											shiftId = shift.id AND
											type = 'IN'
									), 0)
								)
							`),
							'cashFlow'
						]
					]
				},
				include: {
					model: User,
					as: 'user',
					where: {
						businessId
					}
				},
				order: [['date', 'DESC']],
				where: {
					[Op.and]: [
						{
							...(date && { date })
						},
						{
							...(userId && { userId })
						}
					]
				}
			})
			res.status(200).send(shifts)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getSoldDetails: (req: Request, res: Response) => {
		const { shiftId } = req.params

		Sale.findAll({
			attributes: [[fn('sum', col('amount')), 'total']],
			where: {
				shiftId
			},
			include: {
				model: SalePaymentType,
				as: 'paymentType'
			},
			group: 'paymentTypeId'
		})
			.then((results) => res.status(200).send(results))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
