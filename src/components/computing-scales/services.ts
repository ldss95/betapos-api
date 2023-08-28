import { Op } from 'sequelize'

import { notifyUpdate } from '../../utils/helpers'
import { ComputingScaleProps } from './interface'
import { ComputingScale } from './model'

export async function createComputingScale(data: ComputingScaleProps, merchantId: string): Promise<void> {
	await ComputingScale.create({ ...data })
	notifyUpdate('scales', merchantId)
}

export async function updateComputingScale(id: string, data: ComputingScaleProps, merchantId: string): Promise<void> {
	await ComputingScale.update(data, { where: { id } })
	notifyUpdate('scales', merchantId)
}

export async function deleteComputingScale(id: string, merchantId: string): Promise<void> {
	await ComputingScale.destroy({ where: { id } })
	notifyUpdate('scales', merchantId)
}

export async function getAllComputingScale(businessId: string): Promise<ComputingScaleProps[]> {
	const scales = await ComputingScale.findAll({
		where: { businessId }
	})

	return scales.map(scale => scale.toJSON())
}

interface GetUpdatesResponse {
	created: ComputingScaleProps[];
	updated: ComputingScaleProps[];
}
export async function getComputingScalesUpdates(businessId: string, date: string): Promise<GetUpdatesResponse> {
	const created = await ComputingScale.findAll({
		where: {
			...(date != 'ALL' && {
				createdAt: { [Op.gte]: date }
			}),
			businessId
		},
		raw: true
	})
	const updated = await ComputingScale.findAll({
		where: {
			...(date != 'ALL' && {
				updatedAt: { [Op.gte]: date }
			}),
			businessId
		},
		raw: true
	})

	return {
		updated,
		created
	}
}
