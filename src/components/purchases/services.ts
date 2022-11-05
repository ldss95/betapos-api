import moment from 'moment'

import { CustomError } from '../../errors'
import { deleteFile } from '../../helpers'
import { Product } from '../products/model'
import { Provider } from '../providers/model'
import { PurchaseProduct } from '../purchase-products/model'
import { PurchaseProps } from './interface'
import { Purchase } from './model'

export async function getAllPurchases(businessId: string): Promise<PurchaseProps[]> {
	const purchases = await Purchase.findAll({
		where: { businessId },
		include: {
			model: Provider,
			as: 'provider'
		}
	})

	return purchases.map(purchase => purchase.toJSON())
}

export async function getOnePurchase(id: string): Promise<PurchaseProps | null> {
	const purchase = await Purchase.findByPk(id, {
		include: [
			{
				model: Provider,
				as: 'provider'
			},
			{
				model: PurchaseProduct,
				include: [{
					model: Product,
					as: 'product'
				}],
				as: 'products'
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

export async function createPurchase(data: PurchaseProps, businessId: string, userId: string): Promise<string> {
	const provider = await Provider.findByPk(data.providerId)

	if (!provider) {
		throw new CustomError({
			message: 'Invalid providerId'
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

export async function updatePurchase(data: PurchaseProps, businessId: string): Promise<void> {
	const purchase = await Purchase.findByPk(data.id)
	if (!purchase || purchase.businessId !== businessId) {
		return
	}

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

export async function saveUploadedPurchaseFile(id: string, fileUrl: string): Promise<void> {
	const { CDN_URL } = process.env

	// S3 no retorna la URL con la CDN, la cual cuenta con cache
	if (!fileUrl.includes(CDN_URL!)) {
		const breakPoint = fileUrl.indexOf('/purchases')
		fileUrl = `${CDN_URL}${fileUrl.substr(breakPoint)}`
	}

	await Purchase.update(
		{
			fileUrl: encodeURI(fileUrl)
		},
		{
			where: { id }
		}
	)
}

export async function deletePurchaseFile(id: string): Promise<void> {
	const purchase = await Purchase.findByPk(id)
	if (!purchase?.fileUrl) {
		return
	}

	const url = purchase.fileUrl
	await purchase.update({ fileUrl: null })
	const breakPoint = url.indexOf('purchases')
	const fileName: string = decodeURI(url.substr(breakPoint))
	deleteFile(fileName)
}

export async function markPurchaseAsPayed(id: string): Promise<void> {
	await Purchase.update({ payed: true }, { where: { id } })
}

export async function deletePurchase(id: string): Promise<void> {
	const purchase = await Purchase.findByPk(id)
	if (!purchase) {
		return
	}

	await purchase.destroy()
	if (purchase.fileUrl) {
		await deleteFile(purchase.fileUrl)
	}
}

export async function addProductToPurchase(purchaseId: string, productId: string): Promise<void> {
	const product = await Product.findByPk(productId)

	await PurchaseProduct.create({
		purchaseId,
		productId,
		quantity: 1,
		price: product?.cost
	})
}

export async function updatePurchaseProductQty(id: string, quantity: number): Promise<void> {
	await PurchaseProduct.update({ quantity }, {
		where: { id }
	})
}

export async function removePurchaseProduct(id: string): Promise<void> {
	await PurchaseProduct.destroy({
		where: { id }
	})
}
