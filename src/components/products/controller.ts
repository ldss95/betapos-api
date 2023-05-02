import { Request, Response } from 'express'
import { literal } from 'sequelize'
import moment from 'moment'

import { deleteFile, notifyUpdate } from '../../utils/helpers'
import { Barcode } from '../barcodes/model'
import { Product } from './model'
import { Business } from '../business/model'
import { SaleProduct } from '../sales-products/model'
import { Sale } from '../sales/model'
import { PurchaseProduct } from '../purchase-products/model'
import { Purchase } from '../purchases/model'
import { InventoryAdjustment } from '../inventory-adjustments/model'
import { User } from '../users/model'
import {
	createExcelFile,
	createProduct,
	getAllProducts,
	getProducts4Catalogue,
	getUpdates,
	updateProduct
} from './services'

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

		let transactions = [
			{
				id: '1',
				description: 'Creacion del producto',
				stock: product.initialStock,
				quantity: product.initialStock,
				date: product.createdAt,
				type: 'INITIAL_STOCK',
				user: '',
				transactionId: ''
			}
		]

		/**
		 * Obtener las ventas
		 */
		const sales = await SaleProduct.findAll({
			where: {
				productId: id
			},
			include: {
				model: Sale,
				as: 'sale',
				include: [
					{
						model: User,
						as: 'seller',
						paranoid: false
					}
				],
				where: {
					status: 'DONE'
				},
				required: true
			}
		})

		if (sales.length > 0) {
			transactions.push(
				...sales.map(({ quantity, sale, id }) => ({
					id,
					description: 'Venta #' + sale.ticketNumber,
					stock: 0,
					quantity: quantity * -1,
					date: sale.createdAt,
					type: 'SALE',
					user: sale.seller.firstName + ' ' + sale.seller.lastName,
					transactionId: sale.id
				}))
			)
		}

		/**
		 * Obtener las compras
		 */
		const purchases = await PurchaseProduct.findAll({
			where: {
				productId: id
			},
			include: {
				model: Purchase,
				as: 'purchase',
				where: {
					affectsExistence: true
				},
				required: true
			}
		})

		if (purchases.length > 0) {
			transactions.push(
				...purchases.map(({ quantity, purchase, id }) => ({
					id,
					description: 'Compra #' + purchase.documentId,
					stock: 0,
					quantity,
					date: purchase.createdAt,
					type: 'PURCHASE',
					user: '',
					transactionId: purchase.id
				}))
			)
		}

		/**
		 * Obtener ajustes de inventario
		 */
		const adjustments = await InventoryAdjustment.findAll({
			where: {
				productId: id
			},
			include: {
				model: User,
				as: 'user',
				paranoid: false
			}
		})

		if (adjustments.length > 0) {
			transactions.push(
				...adjustments.map(({ quantity, createdAt, description, id, user }) => ({
					id,
					description,
					stock: 0,
					quantity: quantity,
					date: createdAt,
					type: 'INVENTORY_ADJUSTMENT',
					user: user.firstName + ' ' + user.lastName,
					transactionId: id
				}))
			)
		}

		// Ordena por fecha
		transactions = transactions.sort(
			(a, b) => moment(a.date).toDate().getTime() - moment(b.date).toDate().getTime()
		)
		// Asigna el stock
		transactions.forEach((transaction, index) => {
			if (index === 0) {
				return
			}

			transaction.stock = transactions[index - 1].stock + transaction.quantity
		})

		res.status(200).send(transactions)
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
							productId = product.id AND
							type = 'IN'
					), 0) -
					COALESCE((
						SELECT
							SUM(quantity)
						FROM
							inventory_adjustments
						WHERE
							productId = product.id AND
							type = 'OUT'
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
