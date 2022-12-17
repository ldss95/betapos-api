import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { CustomError } from '../../errors'

import { NcfStatusName } from './interface'
import { Ncf, NcfStatus } from './model'
import { getAllNcfAvailability, getBusinessByRnc, getNextNcf } from './services'

export default {
	uploadNcfFile: async (req: Request, res: Response) => {
		try {
			const { file } = req

			if (!file) {
				return res.sendStatus(400)
			}

			const text = file.buffer.toString('utf-8')
			const data = await txtToJson(text)

			if (data.length == 0) {
				return res.sendStatus(400)
			}

			res.sendStatus(100)
			await Ncf.truncate()
			for (let i = 0; i < data.length / 10000; i++) {
				await Ncf.bulkCreate(data.slice(i * 10000, (i + 1) * 10000), { ignoreDuplicates: true })
			}

			console.log('Se ha cargado todo el archivo de RNC')
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getAll: async (req: Request, res: Response) => {
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
			throw error
		}
	},
	getStates: async (req: Request, res: Response) => {
		try {
			const states = await NcfStatus.findAll({ raw: true })
			res.status(200).send(states)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getAvailability: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			const items = await getAllNcfAvailability(businessId)
			res.status(200).send(items)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getByRnc: async (req: Request, res: Response) => {
		try {
			const { rnc } = req.params
			const business = await getBusinessByRnc(rnc)
			res.status(200).send(business)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getNextNcf: async (req: Request, res: Response) => {
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
			throw error
		}
	}
}

interface BusinessProps {
	rnc: string;
	statusName: NcfStatusName;
	businessName: string;
	statusId: string;
}

async function txtToJson(text: string): Promise<BusinessProps[]> {
	// Divide en lineas
	const rows = text.split('\n')

	// Lista estados posibles
	const statuses = await NcfStatus.findAll({ raw: true })
	const STATUS: { [key: string]: string } = {}
	for (const { name, id } of statuses) {
		STATUS[name] = id
	}

	// Conviernte en array de objeto solo con info necesaria
	const businesses: BusinessProps[] = rows.map((row) => {
		const cols = row.split('|')
		const statusName: NcfStatusName = cols[9]?.replace('\r', '')

		return {
			rnc: cols[0],
			businessName: cols[1],
			statusId: STATUS[statusName],
			statusName
		}
	})

	const filterBusiness = ({ rnc, statusName, businessName }: BusinessProps) => {
		if (!Number(rnc)) {
			return false
		}

		return rnc && statusName && businessName && rnc != '' && businessName != ''
	}

	return businesses.filter(filterBusiness)
}
