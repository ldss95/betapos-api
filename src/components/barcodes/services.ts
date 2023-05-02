import { Op } from 'sequelize'

import { Barcode } from './model'
import { Product } from '../products/model'
import { Business } from '../business/model'
import { CustomError, CustomErrorType } from '../../utils/errors'

interface UpdatesResponseProps {
	created: {
		id: string;
		barcode: string;
		productId: string;
	}[];
	updated: {
		id: string;
		barcode: string;
		productId: string;
	}[];
}

export async function getUpdates(date: string, merchantId: string): Promise<UpdatesResponseProps> {
	const business = await Business.findOne({
		where: {
			merchantId
		}
	})

	if (!business) {
		throw new CustomError({
			type: CustomErrorType.AUTH_ERROR,
			name: 'merchantId invalido',
			description: 'El merchantId enviado no es incorrecto o se enuentra inactivo'
		})
	}

	if (!business.isActive) {
		throw new CustomError({
			type: CustomErrorType.AUTH_ERROR,
			description: 'El clinete ha sido desabilitado',
			name: 'Cliente desabilitado'
		})
	}

	const created = await Barcode.findAll({
		attributes: ['id', 'barcode', 'productId'],
		where: {
			...(date != 'ALL' && {
				createdAt: { [Op.gte]: date }
			})
		},
		include: {
			model: Product,
			as: 'product',
			where: {
				businessId: business.id
			},
			required: true
		},
		raw: true
	})
	const updated = await Barcode.findAll({
		attributes: ['id', 'barcode', 'productId'],
		where: {
			...(date != 'ALL' && {
				updatedAt: { [Op.gte]: date }
			})
		},
		include: {
			model: Product,
			as: 'product',
			where: {
				businessId: business.id
			},
			required: true
		},
		raw: true
	})

	return { created, updated }
}
