import { NextFunction, Request, Response } from 'express'
import { UniqueConstraintError } from 'sequelize'

import { createShift, getAllShifts, getShiftSummary, updateShift } from './services'
import { CustomError } from '../../errors'
import { ShiftProps } from './interface'

export default {
	create: async (req: Request, res: Response, next: NextFunction) => {
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

			if (error instanceof UniqueConstraintError) {
				return res.sendStatus(201)
			}

			res.sendStatus(500)
			next(error)
		}
	},
	update: async (req: Request, res: Response, next: NextFunction) => {
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
			next(error)
		}
	},
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const businessId = req.session!.businessId
			const { date, userId, pagination, sorter } = req.query as {
				date: string;
				userId?: string;
				pagination: {
					current: string;
					pageSize: string;
				},
				sorter?: {
					field: keyof ShiftProps,
					order: 'ascend' | 'descend'
				}
			}

			const { shifts, count } = await getAllShifts({
				businessId,
				date,
				userId,
				pagination: {
					current: +pagination?.current,
					pageSize: +pagination?.pageSize
				},
				sorter
			})
			res.status(200).send({
				data: shifts,
				count
			})
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getSoldDetails: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { shiftId } = req.params
			const summary = await getShiftSummary(shiftId)
			res.status(200).send(summary)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
