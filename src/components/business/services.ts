import { Op } from 'sequelize'
import { deleteFile, notifyUpdate } from '../../utils/helpers'

import { BusinessType } from '../business-types/model'
import { Province } from '../provinces/model'
import { BusinessProps } from './interface'
import { Business } from './model'

export async function getOneBusiness({
	id,
	merchantId
}: {
	id?: string;
	merchantId?: string;
}): Promise<BusinessProps | null | undefined> {
	const business = await Business.findOne({
		where: {
			[Op.or]: [
				{
					...(id && { id })
				},
				{
					...(merchantId && { merchantId })
				}
			]
		},
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

	return business?.toJSON()
}

export async function getAllBusiness(role: 'ADMIN' | 'PARTNER', userId: string): Promise<BusinessProps[]> {
	const where = role == 'PARTNER' ? { referredBy: userId } : {}

	const business = await Business.findAll({ where })

	return business.map((business) => business.toJSON())
}

export async function updateBusiness(data: BusinessProps, merchantId: string): Promise<void> {
	await Business.update(data, {
		where: { id: data.id }
	})
	notifyUpdate('business', merchantId)
}

export async function updateBusinessLogo(id: string, url: string): Promise<string> {
	if (url.substr(0, 8) != 'https://') {
		url = `https://${location}`
	}

	const business = await Business.findOne({ where: { id } })

	// Delte current photo if exists
	if (business?.logoUrl && business.logoUrl != url) {
		let key = business.logoUrl.split('/images/').pop()
		key = 'images/' + key
		deleteFile(key)
	}

	business!.update({ logoUrl: location })
	return url
}
