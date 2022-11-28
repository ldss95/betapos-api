import { db } from '../../database/connection'
import { round } from '../../helpers'
import { ClientsGroupProps } from './interface'
import { ClientsGroup } from './model'

export async function getAllClientsGroups(businessId: string): Promise<ClientsGroupProps[]> {
	const groups = await ClientsGroup.findAll({
		where: {
			businessId
		}
	})

	return groups.map(group => group.toJSON())
}

export async function getDebtByClientsGroup(groupId: string): Promise<number> {
	const CREDIT_ID = 'd14005a3-c39e-4a00-87b6-28939213a00f'

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
	const [{ debt }]: any = await db.query(debtQuery, {
		replacements: [
			groupId,
			CREDIT_ID
		],
		type: 'SELECT'
	})

	const payedQuery = `
		SELECT
			SUM(cp.amount) AS payed
		FROM
			clients_payments cp
		INNER JOIN
			clients c ON c.id = cp.clientId
		WHERE
			c.groupId = '640b0588-4ca9-11ed-bef0-d52c5e528293';
	`
	const [{ payed }]: any = await db.query(payedQuery, {
		replacements: [groupId],
		type: 'SELECT'
	})

	return round(debt - payed)
}
