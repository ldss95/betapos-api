import { Request, Response } from 'express'
import { Op } from 'sequelize'

import { Ncf, NcfStatus } from './model'
import {
	getAllNcfAvailability,
	getAllNcfTypes,
	getBusinessByRnc,
	getNextNcf,
	updateAvailability
} from './services'

export default {
	getAll: async (req: Request, res: Response) => {
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
	},
	getStates: async (req: Request, res: Response) => {
		const states = await NcfStatus.findAll({ raw: true })
		res.status(200).send(states)
	},
	getAvailability: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const items = await getAllNcfAvailability(businessId)
		res.status(200).send(items)
	},
	updateAvailability: async (req: Request, res: Response) => {
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
	},
	getByRnc: async (req: Request, res: Response) => {
		const { rnc } = req.params
		const business = await getBusinessByRnc(rnc)
		res.status(200).send(business)
	},
	getNextNcf: async (req: Request, res: Response) => {
		const { type, lastNcf } = req.body
		const merchantId = req.header('merchantId')
		const nextNcf = await getNextNcf(type, lastNcf, merchantId!)
		res.status(200).send({
			ncfNumber: nextNcf
		})
	},
	getTypes: async (req: Request, res: Response) => {
		const types = await getAllNcfTypes()
		res.status(200).send(types)
	}
}
