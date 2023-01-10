import { Business } from '../business/model'
import { BillProps } from './interface'
import { Bill } from './model'

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
