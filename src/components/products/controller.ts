import { Request, Response } from 'express'
import { literal } from 'sequelize'

import { deleteFile, notifyUpdate } from '../../utils/helpers'
import { Barcode } from '../barcodes/model'
import { Product } from './model'
import { Business } from '../business/model'
import {
	createExcelFile,
	createProduct,
	getAllProducts,
	getProducts4Catalogue,
	getUpdates,
	updateProduct
} from './services'
import { Stock } from '../stocks/model'
import { StockTransactionTypeId } from '../stocks/interface'

export default {
	create: async (req: Request, res: Response) => {
		const { businessId, merchantId } = req.session!
		const id = await createProduct(req.body, businessId, merchantId)
		res.status(201).send({ id })
	},
	update: async (req: Request, res: Response) => {
		const { merchantId, userId } = req.session!
		const ip = req.ip
		const agent = req.headers['user-agent']
		await updateProduct(merchantId, req.body, {
			ip,
			agent,
			userId
		})
		res.sendStatus(204)
	},
	delete: async (req: Request, res: Response) => {
		const { id } = req.params
		const { merchantId } = req.session!

		await Product.destroy({ where: { id } })
		notifyUpdate('products', merchantId)

		res.sendStatus(204)
	},
	getAll: async (req: Request, res: Response) => {
		const businessId = req.session!.businessId
		const { limit, page, filters, search, sorter } = req.body

		const data = await getAllProducts({
			businessId,
			limit,
			page,
			search,
			filters,
			sorter
		})
		res.status(200).send(data)
	},
	getTransactions: async (req: Request, res: Response) => {
		const { id } = req.params
		const product = await Product.findOne({
			where: { id }
		})

		if (!product) {
			return res.status(400).send({
				message: 'Producto no encontrado'
			})
		}

		const transactions = await Stock.findAll({
			attributes: {
				include: [
					[
						literal(`
							(SELECT
								CONCAT(firstName, ' ', lastName) AS 'user'
							FROM
								users WHERE id = (
									SELECT
										sellerId
									FROM
										sales
									WHERE
										id = stock.transactionId
								)
							)
						`),
						'user'
					],
					[
						literal(`
							(SELECT
								ticketNumber
							FROM
								sales
							WHERE
								id = stock.transactionId
							)
						`),
						'ticketNumber'
					]
				]
			},
			where: {
				productId: id
			},
			order: [['createdAt', 'DESC']]
		})

		function getTransactionType(transactionTypeId: string) {
			if (transactionTypeId === StockTransactionTypeId.SALE) {
				return 'SALE'
			}

			if (transactionTypeId === StockTransactionTypeId.PURCHASE) {
				return 'PURCHASE'
			}

			return 'INVENTORY_ADJUSTMENT'
		}

		function getDescription(transactionTypeId: string, ticketNumber: string) {
			if (transactionTypeId === StockTransactionTypeId.SALE) {
				return `Venta #${ticketNumber}`
			}

			return ''
		}

		res.status(200).send(
			transactions.map(t => {
				const { id, stock, quantity, createdAt, transactionId, user, transactionTypeId, ticketNumber } = t.toJSON()
				return {
					id,
					description: getDescription(transactionTypeId, ticketNumber),
					stock,
					quantity,
					date: createdAt,
					type: getTransactionType(transactionTypeId),
					user,
					transactionId
				}
			})
		)
	},
	getOne: async (req: Request, res: Response) => {
		const { id } = req.params

		const product = await Product.findOne({ where: { id } })
		res.status(200).send(product)
	},
	addPhoto: async (req: Request, res: Response) => {
		let { location } = req.file as Express.MulterS3.File
		if (location.substr(0, 8) != 'https://') {
			location = `https://${location}`
		}

		const { id } = req.body

		const product = await Product.findOne({ where: { id } })

		// Delte current photo if exists
		if (product?.photoUrl && product.photoUrl != location) {
			let key = product.photoUrl.split('/images/').pop()
			key = 'images/' + key
			deleteFile(key)
		}

		await product!.update({ photoUrl: location })
		res.status(200).send({ photoUrl: location })
	},
	getUpdates: async (req: Request, res: Response) => {
		const { date } = req.params
		const merchantId = req.header('merchantId')

		const business = await Business.findOne({
			where: {
				merchantId
			}
		})

		if (!business || !business.isActive) {
			return res.sendStatus(400)
		}

		const results = await getUpdates(business.id, date)

		res.status(200).send(results)
	},
	export: async (req: Request, res: Response) => {
		const { businessId } = req.session!
		const doc = await createExcelFile(businessId)

		res.status(200).send(doc)
	},
	findByBarcode: async (req: Request, res: Response) => {
		const { barcode } = req.params
		const { businessId } = req.session!

		const stockQuery = `
			ROUND(
				(
					product.initialStock -
					COALESCE((
						SELECT
							SUM(sp.quantity)
						FROM
							sales_products sp
						JOIN
							sales s ON s.id = sp.saleId
						WHERE
							sp.productId = product.id AND
							s.status = 'DONE'
					), 0) +
					COALESCE((
						SELECT
							SUM(pp.quantity)
						FROM
							purchase_products pp
						JOIN
							purchases p ON p.id = pp.purchaseId
						WHERE
							pp.productId = product.id AND
							p.affectsExistence = 1
					), 0) +
					COALESCE((
						SELECT
							SUM(quantity)
						FROM
							inventory_adjustments
						WHERE
							productId = product.id
					), 0)
				),
				2
			)
		`

		const products = await Product.findAll({
			where: {
				businessId
			},
			attributes: {
				include: [[literal(stockQuery), 'stock']]
			},
			include: {
				model: Barcode,
				as: 'barcodes',
				where: {
					barcode
				},
				required: true
			}
		})

		res.status(200).send(products.map((product) => product.toJSON()))
	},
	getProducts4Catalogue: async (req: Request, res: Response) => {
		const { businessId, categoryId, limit, page, search } = req.query as any
		const products = await getProducts4Catalogue({
			businessId,
			limit: Number(limit),
			page: Number(page),
			categoryId,
			search
		})
		res.status(200).send(products)
	}
}
