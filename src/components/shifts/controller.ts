import { Request, Response } from 'express'

import { Shift } from './model'
import { User } from '../users/model'

export default {
	create: (req: Request, res: Response) => {
		const { shift } = req.body
		Shift.create(shift)
			.then(() => res.sendStatus(201))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		const { businessId } = req.session!
		Shift.findAll({
			include: {
				model: User,
				as: 'user',
				where: {
					businessId
				}
			}
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
