import xlsx from 'json-as-xlsx'
import { Op, literal } from 'sequelize'

import { Barcode } from '../barcodes/model'
import { Brand } from '../brands/model'
import { Category } from '../categories/model'
import { ProductAttr } from './interface'
import { Product } from './model'

export async function createExcelFile(businessId: string): Promise<Buffer | undefined> {
	const products = await Product.findAll({
		where: {
			businessId
		},
		attributes: {
			include: [
				[
					literal(`
						ROUND(
							(
								product.initialStock -
								COALESCE((
									SELECT
										SUM(sp.quantity)
									FROM
										sales_products sp
									JOIN
										sales s ON s.id = sp.saleId
									WHERE
										sp.productId = product.id AND
										s.status = 'DONE'
								), 0) +
								COALESCE((
									SELECT
										SUM(pp.quantity)
									FROM
										purchase_products pp
									JOIN
										purchases p ON p.id = pp.purchaseId
									WHERE
										pp.productId = product.id AND
										p.status = 'DONE' AND
										p.affectsExistence = 1
								), 0) +
								COALESCE((
									SELECT
										SUM(quantity)
									FROM
										inventory_adjustments
									WHERE
										productId = product.id AND
										type = 'IN'
								), 0) -
								COALESCE((
									SELECT
										SUM(quantity)
									FROM
										inventory_adjustments
									WHERE
										productId = product.id AND
										type = 'OUT'
								), 0)
							),
							2
						)
					`),
					'stock'
				]
			]
		},
		include: [
			{
				model: Barcode,
				as: 'barcodes'
			},
			{
				model: Brand,
				as: 'brand'
			},
			{
				model: Category,
				as: 'category'
			}
		],
		order: [['name', 'ASC']]
	})

	const categories = await Category.findAll({
		where: {
			businessId
		}
	})

	const columns = [
		{
			label: 'Nombre',
			value: 'name'
		},
		{
			label: 'Marca',
			value: (product: any): string => product?.brand?.name || ''
		},
		{
			label: 'Categoría',
			value: (product: any): string => product?.category?.name || ''
		},
		{
			label: 'Referencia',
			value: 'referenceCode'
		},
		{
			label: 'Código de barras',
			value: (product: any): string => {
				if (product.barcodes.length > 0) {
					return product.barcodes[0].barcode
				}

				return ''
			}
		},
		{
			label: 'Costo',
			value: 'cost'
		},
		{
			label: 'Precio',
			value: 'price'
		},
		{
			label: 'Existencia',
			value: 'stock'
		},
		{
			label: 'Estado',
			value: (product: any): string => (product.isActive ? 'Activo' : 'Inactivo')
		}
	]

	const data = [
		{
			sheet: 'Todos los Productos',
			columns,
			content: products.map((product) => product.toJSON())
		},
		...categories.map(({ name, id }) => ({
			sheet: name.replace(/[^a-zA-Z0-9 ]/g, ''),
			columns,
			content: products.filter(({ categoryId }) => categoryId == id).map((product) => product.toJSON())
		}))
	]

	return xlsx(data, {
		fileName: 'Beta POS Productos',
		extraLength: 3,
		writeOptions: {
			type: 'buffer'
		}
	})
}

interface GetUpdatesResponse {
	created: ProductAttr[];
	updated: ProductAttr[];
}

export async function getUpdates(businessId: string, date: string): Promise<GetUpdatesResponse> {
	const created = await Product.findAll({
		where: {
			...(date != 'ALL' && {
				createdAt: { [Op.gte]: date }
			}),
			businessId
		},
		include: {
			model: Barcode,
			as: 'barcodes'
		}
	})
	const updated = await Product.findAll({
		where: {
			...(date != 'ALL' && {
				updatedAt: { [Op.gte]: date }
			}),
			businessId
		},
		raw: true,
		paranoid: false
	})

	return {
		updated,
		created: created.map((product) => product.toJSON())
	}
}
