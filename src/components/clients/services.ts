import moment from 'moment'
import { col, fn } from 'sequelize'

import { round } from '../../helpers'
import { ClientPaymentProps } from '../clients-payments/interface'
import { ClientPayment } from '../clients-payments/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { SalePayment } from '../sales-payments/model'
import { SaleProps } from '../sales/interface'
import { Sale } from '../sales/model'
import { User } from '../users/model'
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

export async function getClientCreditDetails(clientId: string) {
	const sales = await Sale.findAll({
		where: { clientId },
		include: [
			{
				model: SalePayment,
				include: [
					{
						model: SalePaymentType,
						as: 'type',
						where: {
							name: 'Fiao'
						},
						required: true
					}
				],
				as: 'payments',
				required: true
			},
			{
				model: User,
				as: 'seller',
				paranoid: false
			}
		]
	})

	const payments = await ClientPayment.findAll({
		where: { clientId },
		include: {
			model: User,
			as: 'user',
			paranoid: false
		}
	})

	const data: any = [...payments, ...sales]
		.sort((a: SaleProps | ClientPaymentProps, b: SaleProps | ClientPaymentProps) => {
			return moment(b.createdAt).toDate().getTime() - moment(a.createdAt).toDate().getTime()
		})
		.reverse()

	let lastPending = 0
	for (let i = 0; i < data.length; i++) {
		const item = data[i]
		const type: 'SALE' | 'PAYMENT' = item?.ticketNumber ? 'SALE' : 'PAYMENT'

		if (type == 'PAYMENT') {
			lastPending -= item.amount
			data[i] = {
				...item.toJSON(),
				pending: lastPending
			}
		}

		if (type == 'SALE') {
			const [payment] = item.payments
			lastPending += payment.amount
			data[i] = {
				...item.toJSON(),
				pending: lastPending
			}
		}
	}

	return data.reverse()
}
