import moment from 'moment'

import { CustomError, CustomErrorType } from '../../utils/errors'
import { deleteFile } from '../../utils/helpers'
import { ProductProps } from '../products/interface'
import { Product } from '../products/model'
import { updateProduct } from '../products/services'
import { Provider } from '../providers/model'
import { PurchaseProduct } from '../purchase-products/model'
import { PurchaseProps, PurchaseStatusEnum } from './interface'
import { Purchase, PurchaseStatus } from './model'
import { HistoryAdditionalProps } from '../history/interface'

export async function getAllPurchases(businessId: string): Promise<PurchaseProps[]> {
	const purchases = await Purchase.findAll({
		where: { businessId },
		include: [
			{
				model: Provider,
				as: 'provider'
			},
			{
				model: PurchaseStatus,
				as: 'status'
			}
		],
		order: [['date', 'DESC']]
	})

	return purchases.map(purchase => purchase.toJSON())
}

export async function getOnePurchase(id: string): Promise<PurchaseProps | null> {
	const purchase = await Purchase.findByPk(id, {
		include: [
			{
				model: Provider,
				as: 'provider',
				paranoid: false
			},
			{
				model: PurchaseProduct,
				include: [{
					model: Product,
					as: 'product',
					paranoid: false
				}],
				as: 'products'
			},
			{
				model: PurchaseStatus,
				as: 'status'
			}
		],
		order: [
			[
				{
					model: PurchaseProduct,
					as: 'products'
				},
				'createdAt',
				'DESC'
			]
		]
	})

	if (!purchase) {
		return null
	}

	return purchase?.toJSON()
}

export async function createPurchase(data: PurchaseProps, businessId: string, userId: string) {
	const provider = await Provider.findByPk(data.providerId)

	if (!provider) {
		throw new CustomError({
			type: CustomErrorType.UNKNOWN_ERROR,
			name: 'Invalid providerId',
			description: 'Invalid providerId'
		})
	}

	const { id } = await Purchase.create({
		...data,
		businessId,
		payed: data.paymentType == 'IMMEDIATE',
		...(data.paymentType == 'CREDIT' && {
			creditDays: provider.creditDays,
			deadline: moment(data.date).add(provider.creditDays, 'days').format('YYYY-MM-DD')
		}),
		userId
	})
	return id
}

export async function updatePurchase(data: PurchaseProps, businessId: string) {
	const purchase = await Purchase.findByPk(data.id)
	if (!purchase || purchase.businessId !== businessId) {
		return
	}

	stopIfPurchaseIsFinished(purchase.statusId)

	const provider = await Provider.findByPk(data.providerId)

	const creditDays = async () => {
		if (data.paymentType == 'IMMEDIATE') {
			return null
		}

		return provider?.creditDays
	}

	const deadline = async () => {
		if (data.paymentType == 'IMMEDIATE') {
			return null
		}

		return moment(data.date).add(provider?.creditDays, 'days').format('YYYY-MM-DD')
	}

	const payed = () => {
		if (purchase.paymentType == data.paymentType) {
			return purchase.payed
		}

		if (purchase.paymentType == 'CREDIT') {
			return true
		}

		return false
	}

	await purchase.update({
		...data,
		payed: payed(),
		creditDays: await creditDays(),
		deadline: await deadline()
	})
}

export async function saveUploadedPurchaseFile(id: string, fileUrl: string) {
	const purchase = await Purchase.findByPk(id)
	if (!purchase) {
		return
	}

	stopIfPurchaseIsFinished(purchase.statusId)

	await purchase.update({
		fileUrl: encodeURI(fileUrl)
	})
}

export async function deletePurchaseFile(id: string) {
	const purchase = await Purchase.findByPk(id)
	if (!purchase?.fileUrl) {
		return
	}

	stopIfPurchaseIsFinished(purchase.statusId)

	const url = purchase.fileUrl
	await purchase.update({ fileUrl: null })
	const breakPoint = url.indexOf('purchases')
	const fileName: string = decodeURI(url.substr(breakPoint))
	deleteFile(fileName)
}

export async function markPurchaseAsPayed(id: string) {
	const purchase = await Purchase.findByPk(id)
	purchase && await purchase.update({ payed: true })
}

export async function deletePurchase(id: string) {
	const purchase = await Purchase.findByPk(id)
	if (!purchase) {
		return
	}

	stopIfPurchaseIsFinished(purchase.statusId)

	await purchase.destroy()
	if (purchase.fileUrl) {
		await deleteFile(purchase.fileUrl)
	}
}

export async function addProductToPurchase(purchaseId: string, productId: string) {
	const purchase = await Purchase.findByPk(purchaseId)
	if (!purchase) {
		return
	}

	stopIfPurchaseIsFinished(purchase.statusId)

	const product = await Product.findByPk(productId)

	await PurchaseProduct.create({
		purchaseId,
		productId,
		quantity: 1,
		cost: product?.cost || 0,
		price: product?.price || 0
	})
}

export async function updatePurchaseProductQty(id: string, quantity: number) {
	const product = await PurchaseProduct.findByPk(id)
	if (!product) {
		return
	}

	const purchase = await Purchase.findByPk(product.purchaseId)
	if (!purchase) {
		return
	}

	stopIfPurchaseIsFinished(purchase.statusId)
	await product.update({ quantity })
}

export async function updatePurchaseProductCost(merchantId: string, id: string, cost: number, history: HistoryAdditionalProps) {
	const product = await PurchaseProduct.findByPk(id)
	if (!product) {
		throw new CustomError({
			type: CustomErrorType.UNKNOWN_ERROR,
			name: 'Producto no encontrado',
			description: 'Producto no encontrado',
		})
	}

	const purchase = await Purchase.findByPk(product.purchaseId)
	if (!purchase) {
		return
	}

	stopIfPurchaseIsFinished(purchase.statusId)

	await product.update({ cost })

	updateProduct(
		merchantId,
		{
			id: product.productId,
			cost
		} as ProductProps,
		history
	)
}

export async function updatePurchaseProductPrice(merchantId: string, id: string, price: number, history: HistoryAdditionalProps) {
	const product = await PurchaseProduct.findByPk(id)
	if (!product) {
		throw new CustomError({
			type: CustomErrorType.UNKNOWN_ERROR,
			name: 'Producto no encontrado',
			description: 'Producto no encontrado'
		})
	}

	const purchase = await Purchase.findByPk(product.purchaseId)
	if (!purchase) {
		return
	}

	stopIfPurchaseIsFinished(purchase.statusId)

	await product.update({ price })

	updateProduct(
		merchantId, {
			id: product.productId,
			price
		} as ProductProps,
		history
	)
}

export async function removePurchaseProduct(id: string) {
	const product = await PurchaseProduct.findByPk(id)
	if (!product) {
		return
	}

	const purchase = await Purchase.findByPk(product.purchaseId)
	if (!purchase) {
		return
	}

	stopIfPurchaseIsFinished(purchase.statusId)
	await product.destroy()
}

export async function finishPurchase(id: string) {
	const purchase = await Purchase.findByPk(id)
	purchase && purchase.update({
		statusId: PurchaseStatusEnum.Finished
	})
}

/**
 * Termina la ejecucion lanzando un error 400 si la factura ya se encuentra finalizada.
 * Porque no se pueden modificar facturas finalizadas
 */
function stopIfPurchaseIsFinished(statusId: string) {
	if (statusId === PurchaseStatusEnum.Finished) {
		throw new CustomError({
			type: CustomErrorType.ACTION_NOT_ALLOWED,
			name: 'Factura Cerrada para modificacion',
			description: 'No se puede modificar una factura una vez ha sido marcada como finalizada'
		})
	}
}
