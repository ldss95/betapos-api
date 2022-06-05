import { Request, Response } from 'express'
import { UniqueConstraintError } from 'sequelize'
import { deleteFile } from '../../helpers'
import { Barcode } from '../barcodes/model'
import { Brand } from '../brands/model'
import { BusinessType } from '../business-types/model'
import { Category } from '../categories/model'
import { Product } from '../products/model'
import { Province } from '../provinces/model'
import { User } from '../users/model'

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
			const merchantId = await generateMerchantId()
			await Business.create({ ...req.body, merchantId })
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
	},
	getPosData: async (req: Request, res: Response) => {
		try {
			const { id } = req.query
			const business = await Business.findOne({ where: { id } })

			if (!business) {
				return res.sendStatus(204)
			}

			const users = await User.findAll({
				where: { businessId: id },
				attributes: [
					'id',
					'firstName',
					'lastName',
					'nickName',
					'email',
					'password',
					'gender',
					'roleId',
					'photoUrl',
					'isActive'
				]
			})
			const products = await Product.findAll({
				where: { businessId: id },
				attributes: [
					'id',
					'name',
					'referenceCode',
					'brandId',
					'categoryId',
					'price',
					'itbis',
					'photoUrl',
					'isActive'
				],
				include: {
					model: Barcode,
					as: 'barcodes',
					attributes: ['id', 'barcode']
				}
			})
			const categories = await Category.findAll({
				where: { businessId: id },
				attributes: ['id', 'name', 'description']
			})
			const brands = await Brand.findAll({
				where: { businessId: id },
				attributes: ['id', 'name']
			})

			res.status(200).send({
				business: business.toJSON(),
				users: users.map((user) => user.toJSON()),
				products: products.map((product) => product.toJSON()),
				categories: categories.map((category) => category.toJSON()),
				brands: brands.map((brand) => brand.toJSON())
			})
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
export async function generateMerchantId(): Promise<string> {
	const firstChar = String.fromCharCode(Math.random() * (90 - 65) + 65) // A-Z
	const lastChar = String.fromCharCode(Math.random() * (90 - 65) + 65) // A-Z
	const rdNumber = Math.round(Math.random() * (0 - 999999) + 999999) // 000000 - 999999

	const code = firstChar + lastChar + rdNumber.toString().padStart(6, '0')
	const codeTakend = await Business.count({ where: { merchantId: code } })

	if (!codeTakend) {
		return code
	}

	return await generateMerchantId()
}
