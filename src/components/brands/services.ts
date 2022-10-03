import { BrandProps } from './interface'
import { Brand } from './model'

export async function createBrand(name: string, businessId: string): Promise<void> {
	await Brand.create({ name, businessId })
}

export async function updateBrand(id: string, name: string): Promise<void> {
	await Brand.update({ name }, { where: { id } })
}

export async function deleteBrand(id: string): Promise<void> {
	await Brand.destroy({ where: { id } })
}

export async function listAllBrands(businessId: string): Promise<BrandProps[]> {
	const brands = await Brand.findAll({
		where: { businessId },
		order: [['name', 'ASC']],
		raw: true
	})

	return brands
}

export async function getOneBrand(id: string): Promise<BrandProps> {
	const brand = await Brand.findByPk(id)
	return brand ? brand.toJSON() : ({} as BrandProps)
}
