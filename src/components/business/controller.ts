import { Request, Response } from 'express'
import { UniqueConstraintError } from 'sequelize'
import { deleteFile } from '../../helpers'
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
	getAll: (req: Request, res: Response) => {
		Business.findAll()
			.then((business) => res.status(200).send(business))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	create: async (req: Request, res: Response) => {
		try {
			const merchatId = await getMerchantId()
			await Business.create({ ...req.body, merchatId })
			res.sendStatus(201)
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
	update: (req: Request, res: Response) => {
		const { id } = req.body
		Business.update(req.body, { where: { id } })
			.then(() => res.sendStatus(204))
			.catch((error) => {
				if (error instanceof UniqueConstraintError) {
					const { email, rnc } = req.body

					res.status(400).send({
						message: `El email: "${email}" o el RNC: "${rnc}" ya esta en uso.`
					})
					return
				}

				res.sendStatus(500)
				throw error
			})
	},
	setLogoImage: async (req: any, res: Response) => {
		try {
			const { file } = req
			let { location } = file
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
	}
}

/**
 * Obtiene un string de 9 caracteres unico para ser usado como merchant id de un
 * negoci en el formato AA 999999
 */
async function getMerchantId(): Promise<string> {
	const firstChar = String.fromCharCode(Math.random() * (90 - 65) + 65) // A-Z
	const lastChar = String.fromCharCode(Math.random() * (90 - 65) + 65) // A-Z
	const rdNumber = Math.round(Math.random() * (0 - 999999) + 999999) // 000000 - 999999

	const code = firstChar + lastChar + ' ' + rdNumber.toString().padStart(6, '0')
	const codeTakend = await Business.count({ where: { merchatId: code } })

	if (!codeTakend) {
		return code
	}

	return await getMerchantId()
}
