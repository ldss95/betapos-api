import { CronJob } from 'cron'
import moment from 'moment'

import { Business } from '../business/model'
import { BillProps } from './interface'
import { Bill } from './model'
import { Device } from '../devices/model'

type ROLE_CODE = 'ADMIN' | 'BIOWNER' | 'PARTNER';
export async function listAllInvoices(roleCode: ROLE_CODE, businessId: string, userId: string): Promise<BillProps[]> {
	const invoices = await Bill.findAll({
		include: {
			model: Business,
			as: 'business',
			required: true,
			where: {
				...(roleCode == 'PARTNER' && {
					referredBy: userId
				})
			}
		},
		where: {
			...(roleCode == 'BIOWNER' && {
				businessId
			})
		},
		order: [['createdAt', 'DESC']]
	})

	return invoices.map((item) => item.toJSON())
}

export async function markInvoiceAsPayed(id: string, date: string, voucherUrl?: string): Promise<void> {
	if (voucherUrl && voucherUrl.substr(0, 8) != 'https://') {
		voucherUrl = `https://${voucherUrl}`
	}

	await Bill.update(
		{
			payed: true,
			payedAt: date,
			...(voucherUrl && {
				transferVoucherUrl: voucherUrl
			})
		},
		{
			where: { id }
		}
	)
}

async function generateBills() {
	const clients = await Business.findAll({
		include: {
			model: Device,
			as: 'devices',
			required: true,
			where: {
				isActive: true
			}
		},
		where: {
			isActive: true
		}
	})

	for (const client of clients) {
		const devices = client.devices.length

		const amount = devices > 2 ? 1000 + (devices - 2) * 1000 : 1000

		const lastOrderNumber: number = await Bill.max('orderNumber')

		await Bill.create(
			{
				businessId: client.id,
				orderNumber: `${+lastOrderNumber + 1}`.padStart(8, '0'),
				amount,
				description: `Pago por uso Beta POS ${moment().format('MMMM YYYY')}`
			},
			{ ignoreDuplicates: true }
		)
	}
}

export function startBillGenerator() {
	new CronJob('0 0 8 28 * *', generateBills, null, true, 'America/Santo_Domingo')
}
