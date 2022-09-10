import { Op } from 'sequelize'

import { Barcode } from './model'
import { Product } from '../products/model'

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

export async function getUpdates(date: string, businessId: string): Promise<UpdatesResponseProps> {
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
				businessId
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
				businessId
			},
			required: true
		},
		raw: true
	})

	return { created, updated }
}
