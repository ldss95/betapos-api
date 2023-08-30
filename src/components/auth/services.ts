import { Op, UniqueConstraintError } from 'sequelize'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import moment from 'moment'

import { Business } from '../business/model'
import { Role } from '../roles/model'
import { User } from '../users/model'
import { notifyUpdate } from '../../utils/helpers'
import { db } from '../../database/connection'
import { Bill } from '../billing/model'
import { CustomError, CustomErrorType } from '../../utils/errors'

interface LoginResProps {
	loggedin: boolean;
	token?: string;
	expireSoon?: boolean;
	user?: {
		firstName: string;
		lastName: string;
		email?: string;
		roleId: string;
		id: string;
		businessId: string;
		photoUrl: string;
		roleCode: string;
		merchantId?: string;
	};
}

export async function login(email: string, password: string): Promise<LoginResProps> {
	const user = await User.findOne({
		where: {
			[Op.or]: [{ email }, { nickName: email }]
		},
		include: [
			{
				model: Business,
				as: 'business'
			},
			{
				model: Role,
				as: 'role'
			}
		]
	})

	if (!user || !user.isActive) {
		return { loggedin: false }
	}

	const passwordMatch = bcrypt.compareSync(password, user.password)
	if (!passwordMatch) {
		return { loggedin: false }
	}

	if (user.role.code == 'SELLER') {
		return { loggedin: false }
	}

	const bills = await Bill.findAll({
		where: {
			[Op.and]: [
				{
					payed: false
				},
				{
					businessId: user.businessId
				}
			]
		},
		order: [['createdAt', 'DESC']]
	})

	const omit = user.businessId === '2a5ba546-b7c2-4c2b-abe1-88e7139551e9' // Omite suspension para colmado martin
	if (bills.length >= 2 && !omit) {
		throw new CustomError({
			status: 402,
			name: 'Cuenta suspendida por impago',
			description: 'Su cuenta está fuera de servicio, realice los pagos pendientes para restablecer el acceso',
			type: CustomErrorType.PAYMENT_REQUIRED
		})
	}

	const data = {
		iss: 'Beta-POS-API',
		aud: 'web',
		iat: new Date().getTime() / 1000,
		user: {
			id: user.id,
			name: user.firstName + ' ' + user.lastName,
			email: user.email,
			roleCode: user.role.code,
			createdAt: user.createdAt
		}
	}

	const token = jwt.sign(data, process.env.SECRET_TOKEN || '', {
		expiresIn: '24h'
	})

	return {
		loggedin: true,
		token: token,
		expireSoon: bills.length >= 3,
		user: {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user?.email,
			roleId: user.roleId,
			id: user.id,
			businessId: user.businessId,
			photoUrl: user.photoUrl,
			roleCode: user.role.code,
			merchantId: user?.business?.merchantId
		}
	}
}

export async function changePassword(
	userId: string,
	oldPassword: string,
	newPassword: string,
	merchantId: string
): Promise<boolean> {
	const user = await User.findOne({ where: { id: userId } })
	const passwordMatch = bcrypt.compareSync(oldPassword, user!.password)
	if (!passwordMatch) {
		return false
	}

	const encryptedPassword = bcrypt.hashSync(newPassword, 13)
	user?.update({ password: encryptedPassword })

	notifyUpdate('users', merchantId)
	return true
}

interface CreateAccountRes {
	error?: string;
}

interface CreateAccountUserProps {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	gender: 'M' | 'F' | 'O';
	birthDate: string;
}

interface CreateAccountBusinessProps {
	name: string;
	typeId: string;
	provinceId: string;
	phone?: string;
	referredBy?: string;
}

export async function createAccount(
	user: CreateAccountUserProps,
	business: CreateAccountBusinessProps,
	partnerCode: string
): Promise<CreateAccountRes> {
	const transaction = await db.transaction()

	try {
		if (partnerCode) {
			const partner = await User.findOne({
				where: { partnerCode }
			})

			if (!partner) {
				return { error: 'Codigo Partner incorrecto' }
			}

			business.referredBy = partner.id
		}

		const merchantId = await generateMerchantId()
		const role = await Role.findOne({ where: { code: 'BIOWNER' } })

		const { id } = await Business.create({ ...business, merchantId }, { transaction })
		const password = bcrypt.hashSync(user.password, 13)
		await User.create(
			{
				...user,
				password,
				businessId: id,
				roleId: role?.id
			},
			{
				transaction
			}
		)
		await transaction.commit()
		return {}
	} catch (error) {
		await transaction.rollback()

		if (error instanceof UniqueConstraintError) {
			return { error: '' }
		}

		throw error
	}
}

/**
 * Obtiene un string de 9 caracteres unico para ser usado como merchant id de un
 * negoci en el formato AA 999999
 */
async function generateMerchantId(): Promise<string> {
	const firstChar = String.fromCharCode(Math.random() * (90 - 65) + 65) // A-Z
	const lastChar = String.fromCharCode(Math.random() * (90 - 65) + 65) // A-Z
	const rdNumber = Math.round(Math.random() * (0 - 999999) + 999999) // 000000 - 999999

	const code = firstChar + lastChar + rdNumber.toString().padStart(6, '0')
	const codeTakend = await Business.count({ where: { merchantId: code } })

	if (!codeTakend) {
		return code
	}

	return await generateMerchantId()
}
