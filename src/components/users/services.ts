import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize'
import { format } from '@ldss95/helpers'
import bcrypt from 'bcrypt'

import { CustomError } from '../../errors'
import { notifyUpdate } from '../../helpers'
import { Business } from '../business/model'
import { Role } from '../roles/model'
import { UserProps } from './interface'
import { User } from './model'

export async function deleteUser(id: string, force: boolean, merchantId: string): Promise<void> {
	try {
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
	} catch (error) {
		if (error instanceof ForeignKeyConstraintError) {
			throw new CustomError({
				message: 'No se puede eliminar un usuario despues de haber realizado transacciones, se recomienda desactivar.'
			})
		}

		throw error
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

export async function createUser(user: UserProps, businessId: string, merchantId: string): Promise<string> {
	try {
		const role = await Role.findByPk(user.roleId)

		if (role?.code == 'PARTNER') {
			user.partnerCode = await getPartnerCode()
		}

		const password = await bcrypt.hashSync(user.password, 13)

		const { id } = await User.create({
			...user,
			password,
			businessId
		})

		notifyUpdate('users', merchantId)
		return id
	} catch (error) {
		if (error instanceof UniqueConstraintError) {
			const { fields } = error
			const { email, dui, nickName } = user

			if (fields['users.email']) {
				throw new CustomError({
					message: `El email '${email}' ya está en uso.`
				})
			}

			if (fields['users.dui']) {
				throw new CustomError({
					message: `La cédula '${format.dui(dui)}' ya está en uso.`
				})
			}

			if (fields['users.nickName']) {
				throw new CustomError({
					message: `El nombre de usuario '${nickName}' ya está en uso.`
				})
			}
		}

		if (error instanceof ValidationError) {
			const { message } = error.errors[0]
			throw new CustomError({
				message
			})
		}

		throw error
	}
}


// Asigna un codigo unico de 4 digitos
async function getPartnerCode(): Promise<string> {
	const MAX = 9999
	const MIN = 1
	const DIF = MAX - MIN
	const random = Math.random()
	const intCode = (Math.floor(random * DIF) + MIN).toString()
	const code = intCode.length == 4 ? intCode : intCode.padStart(4, intCode)

	const user = await User.findOne({
		where: {
			partnerCode: code
		}
	})

	if (user) {
		return await getPartnerCode()
	}

	return code
}
