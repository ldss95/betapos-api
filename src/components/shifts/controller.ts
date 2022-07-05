import { Request, Response } from 'express'
import { literal, Op } from 'sequelize'

import { Shift } from './model'
import { User } from '../users/model'
import { Device } from '../devices/model'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { shift } = req.body
			const deviceId = req.header('deviceId')
			const device = await Device.findOne({ where: { deviceId } })
			if (!device || !device.isActive) {
				return res.status(401).send({
					message: 'Unauthorized device'
				})
			}

			await Shift.create({ ...shift, deviceId: device.id })
			res.sendStatus(201)
		} catch (error) {
			res.sendStatus(500)

			throw error
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const { id } = req.body.shift
			const deviceId = req.header('deviceId')
			const device = await Device.findOne({ where: { deviceId } })
			if (!device || !device.isActive) {
				return res.status(401).send({
					message: 'Unauthorized device'
				})
			}

			const shift = await Shift.findByPk(id)

			if (!shift) {
				return res.status(400).send({
					message: 'Turno no encontrado'
				})
			}

			await shift.update(req.body.shift)
			res.sendStatus(204)
		} catch (error) {
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
						[literal('(SELECT SUM(amount) FROM cash_flows WHERE shiftId = shift.id)'), 'cashFlow']
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
	}
	// getOne: (req: Request, res: Response) => {
	// 	const { id } = req.params;
	// 	const query = `SELECT
	// 			(SELECT SUM(amount) FROM Tickets WHERE shiftId = '${id}') AS total,
	// 			(SELECT SUM(discount) FROM Tickets WHERE shiftId = '${id}') AS discounts,
	// 			(SELECT SUM(amount) FROM CashFlows WHERE shiftId = '${id}' AND type = 'IN') AS cashIn,
	// 			(SELECT SUM(amount) FROM CashFlows WHERE shiftId = '${id}' AND type = 'OUT') AS cashOut
	// 		`;

	// 	Shift.sequelize
	// 		?.query(query, { plain: true })
	// 		.then((results) => {
	// 			res.status(200).send(results);
	// 		})
	// 		.catch((error) => {
	// 			res.sendStatus(500);
	// 			throw error;
	// 		});
	// },
}
