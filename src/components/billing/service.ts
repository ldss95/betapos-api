import { Resend } from 'resend'
import moment from 'moment'
import fs from 'fs'
import path from 'path'
import hbs from 'handlebars'
moment.locale('es')

import { Business } from '../business/model'
import { BillProps } from './interface'
import { Bill } from './model'
import { format } from '@ldss95/helpers'
const resend = new Resend(process.env.RESEND_API_KEY)

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

	const bill = await Bill.findByPk(id, {
		include: {
			model: Business,
			as: 'business'
		}
	})

	if (!bill) {
		return
	}

	await bill.update({
		payed: true,
		payedAt: date,
		...(voucherUrl && {
			transferVoucherUrl: voucherUrl
		})
	})
}
