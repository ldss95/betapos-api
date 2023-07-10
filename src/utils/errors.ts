import { NextFunction, Response, Request } from 'express'
import { ZodError } from 'zod'

interface CustomErrorProps {
	description: string;
	status?: number;
	name: string;
	type: CustomErrorType;
}

export class CustomError extends Error {
	public readonly message: string
	public readonly status: number
	public readonly name: string
	public readonly type: CustomErrorType

	constructor({ status, description, name, type }: CustomErrorProps) {
		super(description)

		this.name = name
		this.type = type
		this.message = description
		this.status = status ?? 400
		Error.captureStackTrace(this)
		Object.setPrototypeOf(this, CustomError.prototype)
	}
}

export enum CustomErrorType {
	AUTH_ERROR = 'auth_error',
	NCF_ERROR = 'ncf_error',
	UNKNOWN_ERROR = 'unknown',
	RECORD_NOT_FOUND = 'record_not_found',
	PAYMENT_REQUIRED = 'payment_required',
	ACTION_NOT_ALLOWED = 'action_not_allowed'
}

export function handleZodError(error: unknown, req: Request, res: Response, next: NextFunction) {
	if (error instanceof ZodError) {
		return res.status(400).json({
			errors: error.issues,
			message: 'Informacion incompleta o incorrecta'
		})
	}

	next(error)
}

export function handleCustomError(error: unknown, req: Request, res: Response, next: NextFunction) {
	if (error instanceof CustomError) {
		return res.status(error.status).send({
			message: error.message
		})
	}

	next(error)
}

export function handleUnknownError(error: unknown, req: Request, res: Response, next: NextFunction) {
	res.status(500).send(error)
}
