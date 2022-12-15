import { NcfAvailabilityProps } from './interface'
import { NcfAvailability } from './model'

export async function getAllNcfAvailability(businessId: string): Promise<NcfAvailabilityProps[]> {
	const items = await NcfAvailability.findAll({
		where: {
			businessId
		},
		raw: true
	})

	return items
}
