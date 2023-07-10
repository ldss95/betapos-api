import { Op } from 'sequelize'

import { Inventory, InventoryCount } from './model'
import { CustomError, CustomErrorType } from '../../utils/errors'
import { User } from '../users/model'

export async function getAllInventory(businessId: string) {
	const data = await Inventory.findAll({
		where: {
			businessId
		},
		include: {
			model: User,
			as: 'user'
		},
		order: [['createdAt', 'DESC']]
	})

	return data.map(item => item.toJSON())
}

export async function getInventoryById(id: string) {
	const data = await Inventory.findByPk(id, {
		include: [
			{
				model: User,
				as: 'user'
			},
			{
				model: InventoryCount,
				as: 'counts'
			}
		]
	})

	return data?.toJSON()
}

export async function startNewInventoryCount(businessId: string, userId: string) {
	const inProcessInventory = await Inventory.findOne({
		where: {
			[Op.and]: [
				{ isFinished: false },
				{ businessId }
			]
		}
	})

	if (inProcessInventory) {
		throw new CustomError({
			type: CustomErrorType.ACTION_NOT_ALLOWED,
			name: 'Inventario en curso',
			description: 'Ya tienes un inventario en curso, marcalo como finalizado antes de iniciar otro'
		})
	}

	await Inventory.create({
		businessId,
		userId
	})
}

interface AddProductCount2InventoryParams {
	userId: string;
	inventoryId: string;
	productId: string;
	quantity: number;
}

export async function addProductCount2Inventory(params: AddProductCount2InventoryParams) {
	await InventoryCount.create(params)
}

export async function modifyProductCountOnInventory(id: string, quantity: number) {
	await InventoryCount.update({ quantity }, {
		where: {
			id
		}
	})
}

export async function finishInventory(id: string) {
	await Inventory.update({ isFinished: true }, {
		where: {
			id
		}
	})
}
