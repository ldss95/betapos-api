import { CustomError } from '../../errors'
import { notifyUpdate } from '../../helpers'
import { Business } from '../business/model'
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

	return user
}
