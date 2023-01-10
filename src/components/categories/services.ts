import { CategoryProps } from './interface'
import { Category } from './model'

export async function getCategoriesByBusiness(businessId: string): Promise<CategoryProps[]> {
	const categories = await Category.findAll({
		where: {
			businessId
		},
		raw: true
	})

	return categories
}
