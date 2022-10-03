import { Request, Response } from 'express'

import { createShift, getAllShifts, getShiftSummary, updateShift } from './services'
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
			const { date, userId } = req.query as { [key: string]: string }

			const shifts = await getAllShifts(businessId, date, userId)
			res.status(200).send(shifts)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getSoldDetails: async (req: Request, res: Response) => {
		try {
			const { shiftId } = req.params
			const summary = await getShiftSummary(shiftId)
			res.status(200).send(summary)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
