import { col, fn } from 'sequelize'

import { round } from '../../helpers'
import { ClientPayment } from '../clients-payments/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { SalePayment } from '../sales-payments/model'
import { Sale } from '../sales/model'
import { Client } from './model'

export async function availableClientCredit(clientId: string): Promise<number> {
	const paymentType = await SalePaymentType.findOne({
		where: {
			name: 'Fiao'
		}
	})

	if (!paymentType) {
		throw new Error('Tipo de pago "Fiao" no encontrado')
	}

	const client: any = await Client.findByPk(clientId, {
		attributes: [
			[
				fn('sum', col('sales->payments.amount')), 'debt',
			],
			'creditLimit'
		],
		include: [
			{
				model: Sale,
				as: 'sales',
				where: {
					status: 'DONE'
				},
				include: [{
					model: SalePayment,
					as: 'payments',
					where: {
						typeId: paymentType.id
					},
					attributes: []
				}],
				required: true,
				attributes: []
			}
		],
		raw: true
	})

	const payed = await ClientPayment.sum('amount', {
		where: { clientId }
	})

	return round((client.creditLimit || 0) - ((client.debt || 0) - (payed || 0)))
}
