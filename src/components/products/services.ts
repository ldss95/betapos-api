import xlsx from 'json-as-xlsx'
import { Op, literal } from 'sequelize'

import { notifyUpdate } from '../../helpers'
import { BarcodeProps } from '../barcodes/interface'
import { Barcode } from '../barcodes/model'
import { Brand } from '../brands/model'
import { Category } from '../categories/model'
import { ProductLinkProps, ProductProps } from './interface'
import { Product, ProductLink } from './model'

interface GetAllProductsProps {
	businessId: string;
	limit: number;
	page: number;
	search: string;
	filters: {
		[key: string]: (string | boolean)[];
	};
	sorter: [string, 'ASC' | 'DESC'];
}
export async function getAllProducts({
	businessId,
	limit,
	page,
	search,
	filters,
	sorter
}: GetAllProductsProps): Promise<{ total: number; products: ProductProps[]; count: number; }> {
	const stockQuery = `
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
	`

	const where = {
		[Op.and]: [
			{ businessId },
			{
				...(search &&
					search.length > 0 && {
					[Op.or]: [
						{
							name: {
								[Op.like]: `%${search}%`
							}
						},
						{
							referenceCode: {
								[Op.like]: `%${search}%`
							}
						},
						{
							'$barcodes.barcode$': {
								[Op.like]: `%${search}%`
							}
						}
					]
				})
			},
			{
				...(filters?.isActive != undefined && {
					isActive: filters.isActive[0]
				})
			},
			{
				...(filters?.category &&
					filters.category.length > 0 && {
					categoryId: {
						[Op.in]: filters.category
					}
				})
			},
			{
				...(filters?.brand &&
					filters.brand.length > 0 && {
					brandId: {
						[Op.in]: filters.brand
					}
				})
			}
		]
	}

	const include = [
		{
			model: Barcode,
			as: 'barcodes',
			required: false
		},
		{
			model: Brand,
			as: 'brand',
			required: false
		},
		{
			model: Category,
			as: 'category',
			required: false
		},
		{
			model: ProductLink,
			as: 'linkedProducts',
			include: [{
				model: Product,
				as: 'child'
			}]
		}
	]

	const products = await Product.findAll({
		subQuery: false,
		include,
		attributes: {
			include: [[literal(stockQuery), 'stock']]
		},
		where,
		limit,
		offset: (page - 1) * limit,
		...(sorter &&
			sorter[0] && {
			order: [sorter]
		})
	})

	const total = await Product.count({ where, include })
	const count = await Product.count({ where: { businessId } })

	return {
		products: products.map((product) => product.toJSON()),
		total,
		count
	}
}

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

export async function updateProduct(merchantId: string, product: ProductProps): Promise<void> {
	const { id } = product

	/**
	 * Actualizar producto
	 */
	Product.update(product, { where: { id } })
	notifyUpdate('products', merchantId)

	handleUpdateBarcodes(id, product.barcodes, merchantId)
	handleUpdateLinks(id, product.linkedProducts)
}

interface GetUpdatesResponse {
	created: ProductProps[];
	updated: ProductProps[];
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

async function handleUpdateBarcodes(productId: string, barcodes: BarcodeProps[], merchantId: string) {
	// Eliminados
	await Barcode.destroy({
		where: {
			[Op.and]: [
				{ productId },
				{
					id: {
						[Op.notIn]: barcodes?.map(({ id }) => id) || []
					}
				}
			]
		}
	})

	if (barcodes.length === 0) {
		return notifyUpdate('barcodes', merchantId)
	}

	// Nuevos
	await Barcode.bulkCreate(
		barcodes
			.filter(({ id }) => !id)
			.map(({ barcode }) => ({
				barcode,
				productId
			}))
	)

	// Modificados
	const oldBarcodes = barcodes.filter(({ id }) => id)
	for (const { id, barcode } of oldBarcodes) {
		await Barcode.update(
			{ barcode },
			{
				where: { id }
			}
		)
	}
	notifyUpdate('barcodes', merchantId)
}

async function handleUpdateLinks(productId: string, links: ProductLinkProps[]) {
	// Eliminados
	await ProductLink.destroy({
		where: {
			[Op.and]: [
				{ parentProductId: productId },
				{
					id: {
						[Op.notIn]: links?.map(({ id }) => id) || []
					}
				}
			]
		}
	})

	if (links.length === 0) {
		return
	}

	// Nuevos
	await ProductLink.bulkCreate(
		links
			.filter(({ id }) => !id)
			.map(({ childProductId, quantityOnParent }) => ({
				childProductId,
				quantityOnParent,
				parentProductId: productId
			}))
	)

	// Modificados
	const oldLinks = links.filter(({ id }) => id)
	for (const { id, quantityOnParent } of oldLinks) {
		await ProductLink.update(
			{ quantityOnParent },
			{
				where: { id }
			}
		)
	}
}
