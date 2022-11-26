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
