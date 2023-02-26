import moment from 'moment'
import { literal, Op, QueryTypes } from 'sequelize'
import xlsx from 'json-as-xlsx'

import { db } from '../../database/connection'
import { Client } from '../clients/model'
import { Product } from '../products/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { SalePayment } from '../sales-payments/model'
import { SaleProductProps } from '../sales-products/interface'
import { SaleProduct } from '../sales-products/model'
import { SaleProps } from './interface'
import { Sale } from './model'
import { round } from '../../helpers'
import { User } from '../users/model'

interface GetAllSalesProps {
	pagination: {
		current: number;
		pageSize: number;
	};
	businessId: string;
	filters: {
		paymentType?: string;
		orderType?: string;
		status?: string;
	};
	sorter?: {
		field: keyof SaleProps;
		order: 'ascend' | 'descend';
	};
	search: string;
	dateFrom?: string;
	dateTo?: string;
	shiftId?: string;
}

export async function getAllSales({ pagination, filters, sorter, search, dateFrom, dateTo, shiftId, businessId }: GetAllSalesProps) {
	const currentPage = pagination.current || 1
	const pageSize = pagination.pageSize || 100

	const where = {
		[Op.and]: [
			{ businessId },
			{
				...(shiftId && { shiftId })
			},
			{
				...(filters.paymentType && {
					paymentTypeId: {
						[Op.in]: filters.paymentType
					}
				})
			},
			{
				...(filters.orderType && {
					orderType: {
						[Op.in]: filters.orderType
					}
				})
			},
			{
				...(filters.status && {
					status: {
						[Op.in]: filters.status
					}
				})
			},
			{
				...(search && search !== '' && Number(search) && {
					ticketNumber: {
						[Op.like]: `%${search}%`
					}
				})
			},
			{
				...(search && isNaN(Number(search)) && {
					[Op.or]: [
						{
							'$client.name$': {
								[Op.like]: `%${search}%`
							}
						},
						{
							'$seller.lastName$': {
								[Op.like]: `%${search}%`
							}
						},
						{
							'$seller.firstName$': {
								[Op.like]: `%${search}%`
							}
						}
					]
				})
			},
			{
				...(dateFrom && dateTo && {
					createdAt: {
						[Op.between]: [dateFrom + ' 00:00:00', dateTo + ' 23:59:59']
					}
				})
			},
			{
				...(dateFrom &&
					!dateTo && {
					createdAt: {
						[Op.gte]: dateFrom
					}
				})
			},
			{
				...(!dateFrom &&
					dateTo && {
					createdAt: {
						[Op.lte]: dateTo
					}
				})
			}
		]
	}

	const include = [
		{
			model: Client,
			as: 'client',
			required: false,
			paranoid: false
		},
		{
			model: User,
			as: 'seller',
			paranoid: false
		},
		{
			model: SalePaymentType,
			as: 'paymentType'
		}
	]

	const count = await Sale.count({ where, include })

	const sales = await Sale.findAll({
		where,
		include,
		limit: pageSize,
		offset: (currentPage - 1) * pageSize,
		...(sorter?.field && {
			order: [[sorter.field, sorter.order == 'ascend' ? 'ASC' : 'DESC']]
		}),
		...(!sorter?.field && {
			order: [['createdAt', 'DESC']],
		})
	})

	const total = await (async () => {
		if (!search) {
			return await Sale.sum('amount', { where })
		}

		return sales.reduce((total: number, sale) => total += sale.amount, 0)
	})()

	return {
		count,
		total,
		sales
	}
}

export async function getSalesSummary(businessId: string, type: string) {
	if (type == 'today') {
		return await today(businessId)
	}

	if (type == 'week') {
		return await week(businessId)
	}

	if (type == 'month') {
		return await month(businessId)
	}

	if (type == 'year') {
		return await year(businessId)
	}
}

async function today(businessId: string) {
	const salesQty = await Sale.count({
		where: {
			[Op.and]: [{ businessId }, literal('DATE(sale.createdAt) = CURDATE()')]
		}
	})

	const salesAmount = await Sale.sum('amount', {
		where: {
			[Op.and]: [{ businessId }, literal('DATE(sale.createdAt) = CURDATE()')]
		}
	})

	const sales = await Sale.findAll({
		where: {
			[Op.and]: [{ businessId }, literal('DATE(sale.createdAt) = CURDATE()')]
		},
		include: [
			{
				model: SalePayment,
				as: 'payments',
				include: [
					{
						model: SalePaymentType,
						as: 'type'
					}
				]
			},
			{
				model: SaleProduct,
				as: 'products'
			},
			{
				model: SalePaymentType,
				as: 'paymentType'
			}
		]
	})

	const saleProfit = (total: number, { products }: SaleProps): number => {
		return total + products.reduce(productProfit, 0)
	}

	const productProfit = (total: number, { cost, price, quantity }: SaleProductProps): number => {
		return total + (price - cost) * quantity
	}

	return {
		salesQty: salesQty,
		salesAmount: salesAmount,
		profitsAmount: sales.reduce(saleProfit, 0),
		creditsAmount: sales
			.filter(({ paymentType }) => paymentType.name == 'Fiao' || paymentType.name == 'Mixto')
			.flatMap(({ payments }) => payments)
			.filter(({ type }) => type.name == 'Fiao')
			.reduce((total, { amount }) => total + amount, 0)
	}
}

async function week(businessId: string) {
	const sales: { date: string; amount: number }[] = await db.query(
		`
			SELECT
				ROUND(SUM(amount), 2) AS amount,
				DATE(createdAt) AS date
			FROM
				sales s
			WHERE
				s.businessId = ? AND
				WEEK(s.createdAt) = WEEK(CURDATE()) AND
				YEAR(s.createdAt) = YEAR(CURDATE())
			GROUP BY DATE(s.createdAt)
			ORDER BY date ASC
		`,
		{
			type: QueryTypes.SELECT,
			replacements: [businessId]
		}
	)

	const profits: { date: string; amount: number }[] = await db.query<{ date: string; amount: number }>(
		`
			SELECT
				ROUND(SUM((sp.price - sp.cost) * sp.quantity), 2) AS amount,
				DATE(s.createdAt) AS date
			FROM
				sales s
			LEFT JOIN
				sales_products sp ON sp.saleId = s.id
			WHERE
				s.businessId = ? AND
				WEEK(s.createdAt) = WEEK(CURDATE()) AND
				YEAR(s.createdAt) = YEAR(CURDATE())
			GROUP BY DATE(s.createdAt)
			ORDER BY date ASC
		`,
		{
			type: QueryTypes.SELECT,
			replacements: [businessId]
		}
	)

	const credits: { date: string; amount: number }[] = await db.query<{ date: string; amount: number }>(
		`
			SELECT
				ROUND(SUM(sp.amount), 2) AS amount,
				DATE(s.createdAt) AS date
			FROM
				sales s
			LEFT JOIN
				sales_payments sp ON sp.saleId = s.id
			LEFT JOIN
				sales_payment_types spt ON spt.id = sp.typeId
			WHERE
				s.businessId = ? AND
				spt.name = 'Fiao' AND
				WEEK(s.createdAt) = WEEK(CURDATE()) AND
				YEAR(s.createdAt) = YEAR(CURDATE())
			GROUP BY DATE(s.createdAt)
			ORDER BY date ASC
		`,
		{
			type: QueryTypes.SELECT,
			replacements: [businessId]
		}
	)

	return sales.map(({ amount, date }) => ({
		salesAmount: amount,
		profitsAmount: profits.find((profit) => profit.date == date)?.amount || 0,
		creditsAmount: credits.find((credit) => credit.date == date)?.amount || 0,
		name: moment(date).locale('es').format('dddd')
	}))
}

async function month(businessId: string) {
	const sales: { date: string; amount: number }[] = await db.query(
		`
			SELECT
				ROUND(SUM(amount), 2) AS amount,
				DATE(createdAt) AS date
			FROM
				sales s
			WHERE
				s.businessId = ? AND
				MONTH(s.createdAt) = MONTH(CURDATE()) AND
				YEAR(s.createdAt) = YEAR(CURDATE())
			GROUP BY DATE(s.createdAt)
			ORDER BY date ASC
		`,
		{
			type: QueryTypes.SELECT,
			replacements: [businessId]
		}
	)

	const profits: { date: string; amount: number }[] = await db.query<{ date: string; amount: number }>(
		`
			SELECT
				ROUND(SUM((sp.price - sp.cost) * sp.quantity), 2) AS amount,
				DATE(s.createdAt) AS date
			FROM
				sales s
			LEFT JOIN
				sales_products sp ON sp.saleId = s.id
			WHERE
				s.businessId = ? AND
				MONTH(s.createdAt) = MONTH(CURDATE()) AND
				YEAR(s.createdAt) = YEAR(CURDATE())
			GROUP BY DATE(s.createdAt)
			ORDER BY date ASC
		`,
		{
			type: QueryTypes.SELECT,
			replacements: [businessId]
		}
	)

	const credits: { date: string; amount: number }[] = await db.query<{ date: string; amount: number }>(
		`
			SELECT
				ROUND(SUM(sp.amount), 2) AS amount,
				DATE(s.createdAt) AS date
			FROM
				sales s
			LEFT JOIN
				sales_payments sp ON sp.saleId = s.id
			LEFT JOIN
				sales_payment_types spt ON spt.id = sp.typeId
			WHERE
				s.businessId = ? AND
				spt.name = 'Fiao' AND
				MONTH(s.createdAt) = MONTH(CURDATE()) AND
				YEAR(s.createdAt) = YEAR(CURDATE())
			GROUP BY DATE(s.createdAt)
			ORDER BY date ASC
		`,
		{
			type: QueryTypes.SELECT,
			replacements: [businessId]
		}
	)

	return sales.map(({ amount, date }) => ({
		salesAmount: amount,
		profitsAmount: profits.find((profit) => profit.date == date)?.amount || 0,
		creditsAmount: credits.find((credit) => credit.date == date)?.amount || 0,
		name: moment(date).locale('es').format('DD')
	}))
}

async function year(businessId: string) {
	interface YearlyQueryResProps {
		date: string;
		amount: number;
		month: string;
	}

	const sales: YearlyQueryResProps[] = await db.query(
		`
			SELECT
				ROUND(SUM(amount), 2) AS amount,
				DATE(createdAt) AS date,
				MONTH(createdAt) AS month
			FROM
				sales s
			WHERE
				s.businessId = ? AND
				YEAR(s.createdAt) = YEAR(CURDATE())
			GROUP BY MONTH(s.createdAt)
			ORDER BY month ASC
		`,
		{
			type: QueryTypes.SELECT,
			replacements: [businessId]
		}
	)

	const profits: YearlyQueryResProps[] = await db.query(
		`
			SELECT
				ROUND(SUM((sp.price - sp.cost) * sp.quantity), 2) AS amount,
				DATE(s.createdAt) AS date,
				MONTH(s.createdAt) AS month
			FROM
				sales s
			LEFT JOIN
				sales_products sp ON sp.saleId = s.id
			WHERE
				s.businessId = ? AND
				YEAR(s.createdAt) = YEAR(CURDATE())
			GROUP BY MONTH(s.createdAt)
			ORDER BY month ASC
		`,
		{
			type: QueryTypes.SELECT,
			replacements: [businessId]
		}
	)

	const credits: YearlyQueryResProps[] = await db.query(
		`
			SELECT
				ROUND(SUM(sp.amount), 2) AS amount,
				DATE(s.createdAt) AS date,
				MONTH(s.createdAt) AS month
			FROM
				sales s
			LEFT JOIN
				sales_payments sp ON sp.saleId = s.id
			LEFT JOIN
				sales_payment_types spt ON spt.id = sp.typeId
			WHERE
				s.businessId = ? AND
				spt.name = 'Fiao' AND
				YEAR(s.createdAt) = YEAR(CURDATE())
			GROUP BY MONTH(s.createdAt)
			ORDER BY month ASC
		`,
		{
			type: QueryTypes.SELECT,
			replacements: [businessId]
		}
	)

	return sales.map(({ amount, date, month }) => ({
		salesAmount: amount,
		profitsAmount: profits.find((profit) => profit.month == month)?.amount || 0,
		creditsAmount: credits.find((credit) => credit.month == month)?.amount || 0,
		name: moment(date).locale('es').format('MMMM')
	}))
}

export async function createExcelFile(businessId: string, dateFrom?: string, dateTo?: string): Promise<Buffer | undefined> {
	const conditions: any[] = [{ businessId }]
	if (dateFrom && dateTo) {
		conditions.push({
			createdAt: {
				[Op.between]: [`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`]
			}
		})
	} else if (dateFrom) {
		conditions.push({
			createdAt: {
				[Op.gte]: `${dateFrom} 00:00:00`
			}
		})
	} else if (dateTo) {
		conditions.push({
			createdAt: {
				[Op.lte]: `${dateFrom} 23:59:59`
			}
		})
	}


	const sales = await Sale.findAll({
		where: {
			[Op.and]: conditions
		},
		include: [
			{
				model: Client,
				as: 'client',
				paranoid: false
			},
			{
				model: SalePaymentType,
				as: 'paymentType'
			},
			{
				model: SaleProduct,
				as: 'products',
				include: [{
					model: Product,
					as: 'product',
					paranoid: false
				}]
			}
		],
		order: [['createdAt', 'ASC']]
	})

	const columns = [
		{
			label: 'NO',
			value: 'ticketNumber'
		},
		{
			label: 'Cliente',
			value: (sale: any): string => sale?.client?.name || ''
		},
		{
			label: 'NCF',
			value: ({ ncfNumber, ncfTypeId }: any): string => {
				if (!ncfNumber) {
					return ''
				}

				return `B${ncfTypeId}${ncfNumber.toString().padStart(8, '0')}`
			}
		},
		{
			label: 'RNC',
			value: 'rnc'
		},
		{
			label: 'Razon Social',
			value: 'businessName'
		},
		{
			label: 'Sub Total',
			value: ({ products, amount, discount }: any) => {
				const itbis = products.reduce((total: number, { quantity, product, price }: SaleProductProps) => {
					if (!product.itbis) {
						return total
					}

					return total + ((quantity * price) - ((100 * quantity * price) / (100 + 18)))
				}, 0)

				return round(amount + discount - itbis)
			}
		},
		{
			label: 'Descuentos',
			value: ({ discount }: any) => round(discount)
		},
		{
			label: 'ITBIS',
			value: ({ products }: any) => {
				const itbis = products.reduce((total: number, { quantity, product, price }: SaleProductProps) => {
					if (!product.itbis) {
						return total
					}

					return total + ((quantity * price) - ((100 * quantity * price) / (100 + 18)))
				}, 0)

				return round(itbis)
			}
		},
		{
			label: 'Total',
			value: ({ amount }: any) => round(amount)
		},
		{
			label: 'Metodo de pago',
			value: ({ paymentType }: any) => paymentType.name
		},
		{
			label: 'Fecha',
			value: ({ createdAt }: any) => moment(createdAt).format('DD/MM/YYYY')
		},
		{
			label: 'Hora',
			value: ({ createdAt }: any) => moment(createdAt).format('hh:mm A')
		},
		{
			label: 'Estado',
			value: ({ status }: any) => status === 'DONE' ? 'OK' : 'Cancelada'
		}
	]

	const data = [
		{
			sheet: 'Ventas',
			columns,
			content: sales.map((sale) => sale.toJSON())
		}
	]

	return xlsx(data, {
		fileName: 'Beta POS Ventas',
		extraLength: 3,
		writeOptions: {
			type: 'buffer'
		}
	})
}
