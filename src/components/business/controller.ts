import { Request, Response } from 'express'
import { UniqueConstraintError } from 'sequelize'

import { deleteFile, notifyUpdate } from '../../helpers'
import { BusinessType } from '../business-types/model'
import { Province } from '../provinces/model'
import { Business } from './model'

export default {
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Business.findOne({
			where: { id },
			include: [
				{
					model: BusinessType,
					as: 'type'
				},
				{
					model: Province,
					as: 'province'
				}
			]
		})
			.then((business) => res.status(200).send(business))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getByMerchantId: (req: Request, res: Response) => {
		const merchantId = req.header('merchantId')

		Business.findOne({
			where: { merchantId }
		})
			.then((business) => res.status(200).send(business?.toJSON()))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		Business.findAll()
			.then((business) => res.status(200).send(business))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	update: async (req: Request, res: Response) => {
		try {
			const { id } = req.body

			await Business.update(req.body, { where: { id } })
			const { merchantId } = req.session!
			notifyUpdate('business', merchantId)

			res.sendStatus(204)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				const { email, rnc } = req.body

				res.status(400).send({
					message: `El email: "${email}" o el RNC: "${rnc}" ya esta en uso.`
				})
				return
			}

			res.sendStatus(500)
			throw error
		}
	},
	setLogoImage: async (req: Request, res: Response) => {
		try {
			let { location } = req.file as Express.MulterS3.File
			if (location.substr(0, 8) != 'https://') {
				location = `https://${location}`
			}

			const id = req.session!.businessId
			const business = await Business.findOne({ where: { id } })

			// Delte current photo if exists
			if (business?.logoUrl && business.logoUrl != location) {
				let key = business.logoUrl.split('/images/').pop()
				key = 'images/' + key
				deleteFile(key)
			}

			business!.update({ logoUrl: location })
			res.status(200).send({ logoUrl: location })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	confirm: (req: Request, res: Response) => {
		const { merchantId } = req.query
		Business.findOne({
			where: { merchantId },
			attributes: ['name', 'id']
		})
			.then((business) => {
				if (!business) {
					return res.sendStatus(204)
				}

				res.status(200).send({ name: business.name, id: business.id })
			})
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
