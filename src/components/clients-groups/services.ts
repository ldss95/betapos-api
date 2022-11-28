import { QueryTypes } from 'sequelize'

import { db } from '../../database/connection'
import { round } from '../../helpers'
import { ClientPayment } from '../clients-payments/model'
import { ClientsGroupProps } from './interface'
import { ClientsGroup } from './model'

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
