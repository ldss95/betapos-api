import { NextFunction, Request, Response } from 'express'
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'

export function handleCreateError(error: unknown, req: Request, res: Response, next: NextFunction) {
	if (error instanceof UniqueConstraintError) {
		const { fields } = error

		const { name, email, bankAccount } = req.body

		let message = ''
		if (fields['providers_business_id_name']) {
			message = `Ya tienes un proveedor llamado '${name}'.`
		} else if (fields['providers_business_id_email']) {
			message = `Ya tienes un proveedor con el email '${email}'.`
		} else if (fields['providers_business_id_bank_account']) {
			message = `Ya tienes un proveedor con el numero de cuenta '${bankAccount}'.`
		}

		return res.status(400).send({ message })
	}

	if (error instanceof ForeignKeyConstraintError) {
		return res.status(400).send({
			message: 'RNC Invalido!'
		})
	}

	next(error)
}

export function handleUpdateError(error: unknown, req: Request, res: Response, next: NextFunction) {
	if (error instanceof UniqueConstraintError) {
		const { fields } = error

		const { name, email, bankAccount } = req.body

		let message = ''
		if (fields['providers.name']) {
			message = `Ya tienes un proveedor llamado '${name}'.`
		} else if (fields['providers.email']) {
			message = `Ya tienes un proveedor con el email '${email}'.`
		} else if (fields['providers.bankAccount']) {
			message = `Ya tienes un proveedor con el numero de cuenta '${bankAccount}'.`
		}

		return res.status(400).send({ message })
	}

	if (error instanceof ForeignKeyConstraintError) {
		return res.status(400).send({
			message: 'RNC Invalido!'
		})
	}

	next(error)
}
