import moment from 'moment'
import { Op } from 'sequelize'

import { CustomError } from '../../errors'
import { Business } from '../business/model'
import { Sale } from '../sales/model'
import { NcfAvailabilityProps, NcfProps, NcfTypeId, NcfTypeProps } from './interface'
import { Ncf, NcfAvailability, NcfStatus, NcfType } from './model'

export async function getAllNcfAvailability(businessId: string): Promise<NcfAvailabilityProps[]> {
	const items = await NcfAvailability.findAll({
		where: {
			businessId
		},
		raw: true
	})

	return items
}

interface UpdateAvailabilityProps {
	businessId: string;
	id: string | null;
	startOn: number;
	stopOn: number;
	expireAt: string;
	typeId: NcfTypeId;
}
export async function updateAvailability(params: UpdateAvailabilityProps): Promise<void> {
	const { startOn, stopOn, expireAt, id, businessId, typeId } = params

	if (id) {
		await NcfAvailability.update(
			{
				startOn,
				stopOn,
				expireAt
			},
			{
				where: {
					[Op.and]: [
						{ businessId },
						{ id },
						{ typeId }
					]
				}
			}
		)

		return
	}

	await NcfAvailability.create({
		businessId,
		startOn,
		stopOn,
		expireAt,
		typeId
	})
}

export async function getAllNcfTypes(): Promise<NcfTypeProps[]> {
	const types = await NcfType.findAll({
		raw: true,
		order: [['id', 'ASC']]
	})

	return types
}

export async function getBusinessByRnc(rnc: string): Promise<NcfProps | null> {
	const ncf = await Ncf.findByPk(rnc, {
		include: {
			model: NcfStatus,
			as: 'status'
		}
	})

	if (!ncf) {
		return null
	}

	return ncf.toJSON()
}

export async function getNextNcf(typeId: NcfTypeId, lastLocalNcf: number, merchantId: string): Promise<number> {
	const business = await Business.findOne({
		where: { merchantId }
	})

	if (!business) {
		throw new CustomError({
			message: 'Invalida Merchant ID',
			status: 400
		})
	}

	const availability = await NcfAvailability.findOne({
		where: {
			[Op.and]: [
				{ businessId: business.id },
				{ typeId }
			]
		}
	})

	if (!availability) {
		throw new CustomError({
			message: 'El cliente no cuenta con comprobantes disponibles',
			status: 400
		})
	}

	if (moment(availability.expireAt).isBefore(moment())) {
		throw new CustomError({
			message: 'Comprobantes expirados',
			status: 400
		})
	}

	const lastTicket = await Sale.findOne({
		where: {
			[Op.and]: [
				{
					businessId: business.id
				},
				{
					ncfTypeId: typeId
				}
			]
		}
	})

	const lastCloudNcf = lastTicket?.ncfNumber ?? 0

	if (!lastLocalNcf && !lastCloudNcf) {
		return availability.startOn
	}

	return Math.max(lastCloudNcf || 0, lastLocalNcf || 0, (availability.startOn || 0) - 1) + 1
}

export async function insertNewRNCList(data: NcfProps[]) {
	await Ncf.truncate()
	for (let i = 0; i < data.length / 10000; i++) {
		await Ncf.bulkCreate(data.slice(i * 10000, (i + 1) * 10000), { ignoreDuplicates: true })
	}
	console.log('Lista RNC Cargada')
}
