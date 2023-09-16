import { BusinessType } from '../business-types/model'
import { Province } from '../provinces/model'
import { User } from '../users/model'
import { LeadProps } from './interface'
import { Lead } from './model'

export async function getAllLeads(userId?: string){
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
		order: [['createdAt', 'DESC']],
		where: {
			...(userId && {
				userId
			})
		}
	})

	return leads.map(lead => lead.toJSON())
}

export async function createNewLead(data: LeadProps) {
	await Lead.create({ ...data })
}
