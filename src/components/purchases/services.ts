import moment from 'moment'

import { CustomError } from '../../errors'
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
				as: 'products'
			}
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

	await purchase.update({
		...data,
		creditDays: await creditDays(),
		deadline: await deadline()
	})
}

export async function saveUploadedPurchaseFile(id: string, fileUrl: string): Promise<void> {
	if (fileUrl.includes('http://')) {
		fileUrl = fileUrl.replace('http://', 'https://')
	}

	if (!fileUrl.includes('https://')) {
		fileUrl = 'https://' + fileUrl
	}

	const { CDN_URL, EDGE_URL, ORIGIN_URL } = process.env

	fileUrl = fileUrl
		.replace(ORIGIN_URL!, CDN_URL!)
		.replace(EDGE_URL!, CDN_URL!)

	await Purchase.update({ fileUrl }, { where: { id } })
}
