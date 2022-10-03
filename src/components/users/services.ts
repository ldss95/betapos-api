import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'
import { format } from '@ldss95/helpers'

import { CustomError } from '../../errors'
import { notifyUpdate } from '../../helpers'
import { Business } from '../business/model'
import { Role } from '../roles/model'
import { UserProps } from './interface'
import { User } from './model'

export async function deleteUser(id: string, force: boolean, merchantId: string): Promise<void> {
	const business = await Business.findOne({
		where: {
			merchantId
		}
	})

	const user = await User.findOne({
		where: {
			id
		}
	})

	if (!user) {
		return
	}

	if (user.businessId != business!.id) {
		throw new CustomError({
			message: 'You are trying to remove users that you do not own'
		})
	}

	const deleted = await User.destroy({ where: { id }, force })
	if (deleted) {
		notifyUpdate('users', merchantId)
	}
}

export async function getOneUser(id: string): Promise<UserProps | null> {
	const user = await User.findOne({
		where: { id },
		attributes: [
			'id',
			'firstName',
			'lastName',
			'birthDate',
			'email',
			'nickName',
			'dui',
			'address',
			'photoUrl',
			'roleId',
			'businessId',
			'isActive',
			'createdAt',
			'updatedAt'
		]
	})

	if (!user) {
		return null
	}

	return user.toJSON()
}

export async function getAllUsers(businessId: string): Promise<UserProps[]> {
	const users = await User.findAll({
		attributes: {
			exclude: ['password']
		},
		include: {
			model: Role,
			as: 'role'
		},
		where: { businessId }
	})

	return users.map(user => user.toJSON())
}

export async function getUsersList(businessId: string): Promise<{ id: string; firstName: string; lastName: string; }[]> {
	const users = await User.findAll({
		attributes: ['id', 'firstName', 'lastName'],
		where: { businessId }
	})

	return users.map(user => user.toJSON())
}

export async function updateUser({ id, ...props }: UserProps, merchantId: string): Promise<void> {
	try {
		await User.update(props, { where: { id } })
		notifyUpdate('users', merchantId)
	} catch (error) {
		if (error instanceof UniqueConstraintError) {
			const { fields } = error
			const { email, dui } = props

			let message = ''
			if (fields['users.email']) message = `El email '${email}' ya está en uso.`
			else if (fields['users.dui']) message = `La cedula '${format.dui(dui)}' ya está en uso.`

			throw new CustomError({
				message
			})
		}
	}
}
