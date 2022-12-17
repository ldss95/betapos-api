import moment from 'moment'
import { Op } from 'sequelize'

import { CustomError } from '../../errors'
import { Business } from '../business/model'
import { Sale } from '../sales/model'
import { NcfAvailabilityProps, NcfProps, NcfTypeId } from './interface'
import { Ncf, NcfAvailability, NcfStatus } from './model'

export async function getAllNcfAvailability(businessId: string): Promise<NcfAvailabilityProps[]> {
	const items = await NcfAvailability.findAll({
		where: {
			businessId
		},
		raw: true
	})

	return items
}

export async function getNextNcfNumber(merchantId: string, ncfTypeId: NcfTypeId, lastIdUsed = 0) {
	const business = await Business.findOne({
		where: {
			merchantId
		}
	})

	if (!business) {
		throw new CustomError({
			status: 400,
			message: 'Merchant ID invalido'
		})
	}

	if (!business.isActive) {
		throw new CustomError({
			status: 400,
			message: 'Cuenta suspendida'
		})
	}

	const lastSale = await Sale.findOne({
		where: {
			[Op.and]: [
				{
					businessId: business.id
				},
				{ ncfTypeId }
			]
		},
		order: [['ncfNumber', 'DESC']]
	})
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

	const lastNcf = (() => {
		if (!lastLocalNcf && !lastCloudNcf) {
			return 0
		}

		if (lastCloudNcf > lastLocalNcf) {
			return lastCloudNcf
		} else {
			return lastLocalNcf
		}
	})()

	return lastNcf + 1
}
