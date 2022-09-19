import { Request, Response } from 'express'
import { Op } from 'sequelize'
import moment from 'moment'

import { deleteFile, notifyUpdate } from '../../helpers'
import { Barcode } from '../barcodes/model'
import { Product } from './model'
import { Business } from '../business/model'
import { BarcodeAttr } from '../barcodes/interface'
import { SaleProduct } from '../sales-products/model'
import { Sale } from '../sales/model'
import { PurchaseProduct } from '../purchase-products/model'
import { Purchase } from '../purchases/model'
import { InventoryAdjustment } from '../inventory-adjustments/model'
import { User } from '../users/model'
import { createExcelFile, getAllProducts, getUpdates } from './services'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { businessId, merchantId } = req.session!

			const { id } = await Product.create(
				{ ...req.body, businessId },
				{
					include: {
						model: Barcode,
						as: 'barcodes'
					}
				}
			)

			notifyUpdate('products', merchantId)

			res.status(201).send({ id })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const { id } = req.body
			const { merchantId } = req.session!
			const barcodes = req.body?.barcodes || []

			/**
			 * Actualizar producto
			 */
			Product.update(req.body, { where: { id } })
			notifyUpdate('products', merchantId)

			/**
			 * Actualizar los codigos de barras
			 */
			// Eliminados
			await Barcode.destroy({
				where: {
					[Op.and]: [
						{ productId: id },
						{
							id: {
								[Op.notIn]: barcodes?.map(({ id }: BarcodeAttr) => id) || []
							}
						}
					]
				}
			})

			// Nuevos
			await Barcode.bulkCreate(
				barcodes
					.filter(({ id }: BarcodeAttr) => !id)
					.map(({ barcode }: BarcodeAttr) => ({
						barcode,
						productId: id
					}))
			)

			// Modificados
			const oldBarcodes = barcodes.filter(({ id }: BarcodeAttr) => id)
			for (const { id, barcode } of oldBarcodes) {
				await Barcode.update(
					{ barcode },
					{
						where: { id }
					}
				)
			}
			notifyUpdate('products', merchantId)

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	delete: async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const { merchantId } = req.session!

			await Product.destroy({ where: { id } })
			notifyUpdate('products', merchantId)

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getAll: async (req: Request, res: Response) => {
		try {
			const businessId = req.session!.businessId
			const { limit, page, filters, search, sorter } = req.body

			const data = await getAllProducts({ businessId, limit, page, search: `${search}`, filters, sorter })
			res.status(200).send(data)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getTransactions: async (req: Request, res: Response) => {
		try {
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
							as: 'seller'
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
						affectsExistence: true,
						status: 'DONE'
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
					as: 'user'
				}
			})

			if (adjustments.length > 0) {
				transactions.push(
					...adjustments.map(({ quantity, createdAt, description, type, id, user }) => ({
						id,
						description,
						stock: 0,
						quantity: type === 'IN' ? quantity : quantity * -1,
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
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Product.findOne({ where: { id } })
			.then((product) => res.status(200).send(product))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	addPhoto: async (req: Request, res: Response) => {
		try {
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
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	getUpdates: async (req: Request, res: Response) => {
		try {
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
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	},
	export: async (req: Request, res: Response) => {
		try {
			const { businessId } = req.session!
			const doc = await createExcelFile(businessId)

			res.status(200).send(doc)
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
