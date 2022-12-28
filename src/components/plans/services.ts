import { PlanProps } from './interface'
import { Plan } from './model'

export async function getPlans(): Promise<PlanProps[]> {
	const plans = await Plan.findAll()
	return plans.map(plan => plan.toJSON())
}
