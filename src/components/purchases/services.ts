import moment from 'moment'

import { CustomError } from '../../errors'
import { Provider } from '../providers/model'
import { PurchaseProps } from './interface'
import { Purchase } from './model'

export async function fetchAllPurchases(businessId: string): Promise<PurchaseProps[]> {
	const purchases = await Purchase.findAll({
		where: { businessId },
		include: {
			model: Provider,
			as: 'provider'
		}
	})

	return purchases.map(purchase => purchase.toJSON())
}

export async function createPurchase(data: PurchaseProps, businessId: string): Promise<string> {
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
		})
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
