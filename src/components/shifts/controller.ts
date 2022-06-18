import { Request, Response } from 'express'
import { literal } from 'sequelize'

import { Shift } from './model'
import { User } from '../users/model'
import { Device } from '../devices/model'
import { Sale } from '../sales/model'

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
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!
		Shift.findAll({
			attributes: {
				include: [[literal('(SELECT SUM(amount) FROM sales WHERE shiftId = shift.id)'), 'totalSold']]
			},
			include: {
				model: User,
				as: 'user',
				where: {
					businessId
				}
			},
			order: [['date', 'DESC']]
		})
			.then((shifts) => res.status(200).send(shifts))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
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
