import { CustomError } from '../../errors'
import { Device } from '../devices/model'
import { ShiftProps } from './interface'
import { Shift } from './model'

export async function createShift(shift: ShiftProps, deviceId: string) {
	const device = await Device.findOne({ where: { deviceId } })
	if (!device || !device.isActive) {
		throw new CustomError({
			message: 'Unauthorized device',
			status: 401
		})
	}

	await Shift.create({ ...shift, deviceId: device.id })
}

export async function updateShift(shiftId: string, deviceId: string, data: ShiftProps): Promise<void> {
	const device = await Device.findOne({ where: { deviceId } })
	if (!device || !device.isActive) {
		throw new CustomError({
			message: 'Unauthorized device',
			status: 401
		})
	}

	const shift = await Shift.findByPk(shiftId)

	if (!shift) {
		throw new CustomError({
			message: 'Turno no encontrado'
		})
	}

	await shift.update(data)
}
