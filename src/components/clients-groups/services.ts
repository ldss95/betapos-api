import { QueryTypes, Op } from 'sequelize'
import { format, pdf } from '@ldss95/helpers'
import path from 'path'
import moment from 'moment'
// eslint-disable-next-line
// @ts-ignore
import phantom from 'phantomjs-prebuilt'

import { db } from '../../database/connection'
import { round } from '../../helpers'
import { ClientPayment } from '../clients-payments/model'
import { ClientsGroupProps } from './interface'
import { ClientsGroup } from './model'
import { Sale } from '../sales/model'
import { Client } from '../clients/model'
import { SalePayment } from '../sales-payments/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { User } from '../users/model'
import { Business } from '../business/model'

const CREDIT_ID = 'd14005a3-c39e-4a00-87b6-28939213a00f'

export async function getAllClientsGroups(businessId: string): Promise<ClientsGroupProps[]> {
	const groups = await ClientsGroup.findAll({
		where: {
			businessId
		}
	})

	return groups.map(group => group.toJSON())
}

export async function getDebtByClientsGroup(groupId: string): Promise<number> {
	const debtQuery = `
		SELECT
			SUM(sp.amount) AS debt
		FROM
			sales s
		INNER JOIN
			sales_payments sp ON sp.saleId = s.id
		INNER JOIN
			clients c ON s.clientId = c.id
		WHERE
			s.status = 'DONE' AND
			c.groupId = ? AND
			sp.typeId = ?
	`
	const [{ debt }] = await db.query<{ debt: number }>(debtQuery, {
		replacements: [
			groupId,
			CREDIT_ID
		],
		type: QueryTypes.SELECT
	})

	const payedQuery = `
		SELECT
			SUM(cp.amount) AS payed
		FROM
			clients_payments cp
		INNER JOIN
			clients c ON c.id = cp.clientId
		WHERE
			c.groupId = ?;
	`
	const [{ payed }] = await db.query<{ payed: number; }>(payedQuery, {
		replacements: [groupId],
		type: QueryTypes.SELECT
	})

	return round(debt - payed)
}

export async function applyClientsGroupPayment(groupId: string, date: string, userId: string): Promise<void> {
	const group = await ClientsGroup.findByPk(groupId)

	const debtQuery = `
		SELECT
			c.id AS clientId,
			c.name,
			ROUND(SUM(sp.amount), 2) AS debt
		FROM
			sales s
		INNER JOIN
			sales_payments sp ON sp.saleId = s.id
		INNER JOIN
			clients c ON s.clientId = c.id
		WHERE
			s.status = 'DONE' AND
			c.groupId = ? AND
			sp.typeId = ? AND
			DATE(s.createdAt) <= ?
		GROUP BY s.clientId;
	`

	const debts = await db.query<{ clientId: string; name: string; debt: number }>(debtQuery, {
		replacements: [groupId, CREDIT_ID, date],
		type: QueryTypes.SELECT
	})

	const payedQuery = `
		SELECT
			c.id AS clientId,
			SUM(cp.amount) AS payed
		FROM
			clients_payments cp
		INNER JOIN
			clients c ON c.id = cp.clientId
		WHERE
			c.groupId = ?
		GROUP BY c.id;
	`
	const payed = await db.query<{ clientId: string; payed: number; }>(payedQuery, {
		replacements: [groupId],
		type: QueryTypes.SELECT
	})

	const payments = debts.map(({ clientId, debt }) => ({
		clientId,
		userId,
		amount: debt - (() => {
			const totalPayed = payed.find((payedBC) => payedBC.clientId === clientId)
			if (!totalPayed) {
				return 0
			}

			return totalPayed.payed
		})(),
		description: `Pago Grupo ${group?.name}`
	}))

	await ClientPayment.bulkCreate(payments.filter(({ amount }) => amount > 0))
}

export async function generateClientsGroupDetailsReport(groupId: string, startAt: string, endAt: string, userId: string) {
	const fiao = await SalePaymentType.findOne({
		where: {
			name: 'Fiao'
		}
	})

	const sales = await Sale.findAll({
		include: [
			{
				model: Client,
				as: 'client',
				where: { groupId },
				required: true,
				paranoid: false
			},
			{
				model: SalePayment,
				as: 'payments',
				where: {
					typeId: fiao?.id
				},
				required: true
			}
		],
		where: {
			[Op.and]: [
				{
					createdAt: {
						[Op.gt]: startAt + ' 00:00:00'
					}
				},
				{
					createdAt: {
						[Op.lt]: endAt + ' 23:59:59'
					}
				}
			]
		},
		order: [['createdAt', 'asc']]
	})

	const user = await User.findOne({
		where: { id: userId },
		include: {
			model: Business,
			as: 'business'
		}
	})

	const group = await ClientsGroup.findByPk(groupId)

	const templatePath = path.join(__dirname, '../../templates/clients_group_details.hbs')
	return await pdf.toStream(templatePath, {
		businessName: user?.business.name,
		groupName: group?.name,
		startDate: moment(startAt).format('DD-MM-YYYY'),
		endDate: moment(endAt).format('DD-MM-YYYY'),
		date: moment().format('DD-MM-YYYY'),
		sales: sales.map(({ client, ticketNumber, createdAt, payments }, index) => {
			return {
				no: index + 1,
				amount: format.cash(
					round(payments.find(({ typeId }) => typeId === fiao?.id)?.amount || 0),
					2
				),
				clientName: client.name,
				clientDui: client.dui ? format.dui(client.dui) : '',
				ticketNumber,
				date: moment(createdAt).format('DD-MM-YYYY'),
				time: moment(createdAt).format('hh:mm A')
			}
		}),
		total: format.cash(
			round(
				sales
					.map(({ payments }) => payments)
					.flat()
					.filter(({ typeId }) => typeId === fiao?.id)
					.reduce((total, payment) => total += payment.amount, 0)
			),
			2
		),
		phantomPath: phantom.path
	})
}
