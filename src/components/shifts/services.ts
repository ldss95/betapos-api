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
