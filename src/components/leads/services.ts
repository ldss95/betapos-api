import { BusinessType } from '../business-types/model'
import { Province } from '../provinces/model'
import { User } from '../users/model'
import { Lead } from './model'

export async function getAllLeads(){
	const leads = await Lead.findAll({
		include: [
			{
				model: Province,
				as: 'province'
			},
			{
				model: User,
				as: 'user'
			},
			{
				model: BusinessType,
				as: 'type'
			}
		],
		order: [['createdAt', 'DESC']]
	})

	return leads.map(lead => lead.toJSON())
}
