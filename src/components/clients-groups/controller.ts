import { NextFunction, Request, Response } from 'express'

import { applyClientsGroupPayment, generateClientsGroupDetailsReport, getAllClientsGroups, getDebtByClientsGroup } from './services'

export default {
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const groups = await getAllClientsGroups(req.session!.businessId)
			res.status(200).send(groups)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getDebtByGroup: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { groupId } = req.params
			const debt = await getDebtByClientsGroup(groupId)
			res.status(200).send({ debt })
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	applyClientsGroupPayments: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { groupId, date } = req.body
			await applyClientsGroupPayment(groupId, date, req.session!.userId)
			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getDetailedReport: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const startAt = req.query.startAt as string
			const endAt = req.query.endAt as string
			const groupId = req.query.groupId as string
			const { userId } = req.session!

			const buffer = await generateClientsGroupDetailsReport(groupId, startAt, endAt, userId)
			res.contentType('application/pdf')
			res.send(buffer)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
