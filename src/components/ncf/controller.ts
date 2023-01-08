import { NextFunction, Request, Response } from 'express'
import { Op } from 'sequelize'
import { CustomError } from '../../errors'

import { Ncf, NcfStatus } from './model'
import { getAllNcfAvailability, getAllNcfTypes, getBusinessByRnc, getNextNcf, updateAvailability } from './services'

export default {
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { pagination, filters, sorter, search } = req.body
			const pageSize = pagination?.pageSize || 100
			const currentPage = pagination?.current || 1

			const where = {
				[Op.and]: [
					{
						...(search &&
							search.length > 0 && {
							[Op.or]: [
								{
									businessName: {
										[Op.like]: `%${search}%`
									}
								},
								{
									rnc: {
										[Op.like]: `%${search}%`
									}
								}
							]
						})
					},
					{
						...(filters &&
							filters['status.name'] && {
							statusId: {
								[Op.in]: filters['status.name']
							}
						})
					}
				]
			}

			const count = await Ncf.count({ where })
			const ncfs = await Ncf.findAll({
				include: {
					model: NcfStatus,
					as: 'status'
				},
				raw: true,
				limit: pageSize,
				offset: (currentPage - 1) * pageSize,
				order: [['businessName', 'ASC']],
				...(sorter &&
					sorter.field && {
					order: [[sorter.field, sorter.order == 'ascend' ? 'ASC' : 'DESC']]
				}),
				where
			})

			res.status(200).send({
				count,
				data: ncfs
			})
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getStates: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const states = await NcfStatus.findAll({ raw: true })
			res.status(200).send(states)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getAvailability: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { businessId } = req.session!
			const items = await getAllNcfAvailability(businessId)
			res.status(200).send(items)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	updateAvailability: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { typeId, startOn, stopOn, expireAt, id } = req.body
			const { businessId } = req.session!
			await updateAvailability({
				businessId,
				startOn,
				stopOn,
				expireAt,
				typeId,
				id
			})

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getByRnc: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { rnc } = req.params
			const business = await getBusinessByRnc(rnc)
			res.status(200).send(business)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getNextNcf: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { type, lastNcf } = req.body
			const merchantId = req.header('merchantId')
			const nextNcf = await getNextNcf(type, lastNcf, merchantId!)
			res.status(200).send({
				ncfNumber: nextNcf
			})
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
	getTypes: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const types = await getAllNcfTypes()
			res.status(200).send(types)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
