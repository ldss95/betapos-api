import { Request, Response } from 'express'
import { UniqueConstraintError } from 'sequelize'

import { getAllBusiness, getOneBusiness, updateBusiness, updateBusinessLogo } from './services'

export default {
	getOne: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const business = await getOneBusiness({ id })
			res.status(200).send(business)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getByMerchantId: async (req: Request, res: Response) => {
		try {
			const merchantId = req.header('merchantId')
			const business = await getOneBusiness({ merchantId })
			res.status(200).send(business)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getAll: async (req: Request, res: Response) => {
		try {
			const { roleCode, id } = req.session!
			const business = await getAllBusiness(roleCode, id)
			res.status(200).send(business)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const { merchantId } = req.session!
			await updateBusiness(req.body, merchantId)

			res.sendStatus(204)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				const { email, rnc } = req.body

				return res.status(400).send({
					message: `El email: "${email}" o el RNC: "${rnc}" ya esta en uso.`
				})
			}

			res.sendStatus(500)
			throw error
		}
	},
	setLogoImage: async (req: Request, res: Response) => {
		try {
			const id = req.session!.businessId
			const { location } = req.file as Express.MulterS3.File
			const logoUrl = await updateBusinessLogo(id, location)

			res.status(200).send({ logoUrl })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	confirm: async (req: Request, res: Response) => {
		try {
			const { merchantId } = req.query
			const business = await getOneBusiness({ merchantId: `${merchantId}` })

			if (!business) {
				return res.sendStatus(204)
			}

			res.status(200).send({ name: business.name, id: business.id })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
