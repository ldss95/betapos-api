import { NextFunction, Request, Response } from 'express'
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'

import { createShift, getAllShifts, getShiftSummary, updateShift } from './services'
import { CustomError } from '../../utils/errors'
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

			if (error instanceof ForeignKeyConstraintError) {
				return res.status(400).send({
					value: error.value,
					table: error.table,
					fields: error.fields,
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

			if (error instanceof ForeignKeyConstraintError) {
				return res.status(400).send({
					value: error.value,
					table: error.table,
					fields: error.fields,
					message: error.message
				})
			}

			res.sendStatus(500)
			next(error)
		}
	},
	getAll: async (req: Request, res: Response) => {
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
	},
	getSoldDetails: async (req: Request, res: Response, next: NextFunction) => {
		const { shiftId } = req.params
		const summary = await getShiftSummary(shiftId)
		res.status(200).send(summary)
	}
}
