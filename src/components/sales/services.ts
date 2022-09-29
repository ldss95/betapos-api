import moment from 'moment'
import { literal, Op, QueryTypes } from 'sequelize'

import { db } from '../../database/connection'
import { SalePaymentType } from '../sales-payments-types/model'
import { SalePayment } from '../sales-payments/model'
import { SaleProductAttr } from '../sales-products/interface'
import { SaleProduct } from '../sales-products/model'
import { SaleAttr, SalesSummaryProps } from './interface'
import { Sale } from './model'

export async function getSalesSummary(businessId: string): Promise<SalesSummaryProps> {
	return {
		today: await today(businessId),
		week: await week(businessId),
		month: await month(businessId),
		year: await year(businessId)
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

	const saleProfit = (total: number, { products }: SaleAttr): number => {
		return total + products.reduce(productProfit, 0)
	}

	const productProfit = (total: number, { cost, price, quantity }: SaleProductAttr): number => {
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
