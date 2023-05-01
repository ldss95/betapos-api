import { literal, Op, col, fn } from 'sequelize'

import { CustomError, CustomErrorType } from '../../errors'
import { Device } from '../devices/model'
import { SalePaymentType } from '../sales-payments-types/model'
import { SalePayment } from '../sales-payments/model'
import { Sale } from '../sales/model'
import { User } from '../users/model'
import { ShiftProps } from './interface'
import { Shift } from './model'

export async function createShift(shift: ShiftProps, deviceId: string) {
	const device = await Device.findOne({ where: { deviceId } })
	if (!device || !device.isActive) {
		throw new CustomError({
			type: CustomErrorType.AUTH_ERROR,
			name: 'Dispositivo no permitido',
			description: 'El terminal que intenta usar no ha sido registrado o ha sido desactivado'
		})
	}

	await Shift.create({ ...shift, deviceId: device.id })
}

export async function updateShift(shiftId: string, deviceId: string, data: ShiftProps): Promise<void> {
	const device = await Device.findOne({ where: { deviceId } })
	if (!device || !device.isActive) {
		throw new CustomError({
			type: CustomErrorType.AUTH_ERROR,
			name: 'Dispositivo no permitido',
			description: 'El terminal que intenta usar no ha sido registrado o ha sido desactivado'
		})
	}

	const shift = await Shift.findByPk(shiftId)

	if (!shift) {
		throw new CustomError({
			type: CustomErrorType.UNKNOWN_ERROR,
			name: 'Turno no encontrado',
			description: 'Turno no encontrado'
		})
	}

	await shift.update(data)
}

interface GetAllShiftsProps {
	businessId: string;
	date?: string;
	userId?: string;
	pagination: {
		current: number;
		pageSize: number;
	};
	sorter?: {
		field: keyof ShiftProps;
		order: 'ascend' | 'descend';
	};
}

export async function getAllShifts(params: GetAllShiftsProps): Promise<{ shifts: ShiftProps[]; count: number }> {
	const { businessId, date, userId, sorter, pagination } = params
	const currentPage = pagination.current || 1
	const pageSize = pagination.pageSize || 100

	const where = {
		[Op.and]: [
			{
				...(date && { date })
			},
			{
				...(userId && { userId })
			}
		]
	}

	const include = {
		model: User,
		as: 'user',
		where: {
			businessId
		},
		paranoid: false
	}

	const count = await Shift.count({ where, include })

	const shifts = await Shift.findAll({
		attributes: {
			include: [
				[
					literal('(SELECT SUM(amount) FROM sales WHERE shiftId = shift.id AND status = \'DONE\')'),
					'totalSold'
				],
				[
					literal(`
						(
							SELECT
								SUM(sp.amount)
							FROM
								sales s
							LEFT JOIN
								sales_payments sp ON sp.saleId = s.id
							LEFT JOIN
								sales_payment_types spt ON spt.id = sp.typeId
							WHERE
								shiftId = shift.id AND
								status = 'DONE' AND
								spt.name = 'Efectivo'
						)
					`),
					'totalSoldCash'
				],
				[
					literal(`
						(
							COALESCE((
								SELECT
									SUM(-1 * amount)
								FROM
									cash_flows
								WHERE
									shiftId = shift.id AND
									type = 'OUT'
							), 0) +
							COALESCE((
								SELECT
									SUM(amount)
								FROM
									cash_flows
								WHERE
									shiftId = shift.id AND
									type = 'IN'
							), 0)
						)
					`),
					'cashFlow'
				]
			]
		},
		include,
		...(sorter?.field && {
			order: [[sorter.field, sorter.order === 'descend' ? 'DESC' : 'ASC']],
		}),
		...(!sorter?.field && {
			order: [['date', 'DESC']],
		}),
		where,
		limit: pageSize,
		offset: (currentPage - 1) * pageSize,
	})

	return {
		shifts,
		count
	}
}

export async function getShiftSummary(shiftId: string): Promise<{ total: number; name: string }[]> {
	const items = await Sale.findAll({
		attributes: [[fn('sum', col('payments.amount')), 'total']],
		where: {
			shiftId
		},
		include: {
			model: SalePayment,
			as: 'payments',
			include: [{
				model: SalePaymentType,
				as: 'type'
			}]
		},
		group: 'payments.typeId',
	}) as any[]

	return items
		.map(item => item.toJSON())
		.filter(({ total, payments }) => total && payments.length)
		.map(({ total, payments }) => {
			const [{ type }] = payments

			return {
				total,
				name: type.name
			}
		})
}
