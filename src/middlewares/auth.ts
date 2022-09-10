import { NextFunction, Response, Request } from 'express'
import jwt from 'jsonwebtoken'

/**
 * Verifica si hay una sesion iniciada, de lo contrario devuelve un estado 401
 */
export function isLoggedin(req: Request, res: Response, next: NextFunction): Response | void {
	if (req.session?.loggedin) {
		return next()
	}

	res.status(401).send({
		message: 'Ninguna sesion iniciada'
	})
}

/**
 * Verifica que el usuario logueado tenga los permisos necesarios.
 * De lo contrario devuelve un estado 403
 */
export function havePermissions(req: Request, res: Response, next: NextFunction): Response | void {
	if (req && res) {
		next()
	}
}

/**
 * Verifica si hay token y es valido, de lo contrario devuelve un estado 403
 */
export function tokenIsValid(req: Request, res: Response, next: NextFunction): Response | void {
	const bearerHeader = req.headers.authorization

	if (!bearerHeader) {
		res.status(401).send({
			message: 'No se encontro el token'
		})
		return
	}

	const bearer = bearerHeader.split(' ')
	const token = bearer[1]

	jwt.verify(token, process.env.SECRET_TOKEN || '', (error) => {
		if (error) {
			res.status(401).send({
				message: 'Token invalido'
			})
			return
		}

		next()
	})
}

/**
 * Valida que el usuario logueado sea administrador
 */
export function isAdmin(req: Request, res: Response, next: NextFunction): Response | void {
	const role = req.session!.roleCode

	if (role != 'ADMIN') {
		return res.status(403).send({
			message: 'No posee privilegios suficientes'
		})
	}

	next()
}

/**
 * Valida que el usuario logueado sea administrador de negocio
 */
export function isBusinessAdmin(req: Request, res: Response, next: NextFunction): Response | void {
	const role = req.session!.roleCode

	if (role != 'BIOWNER') {
		return res.status(403).send({
			message: 'No posee privilegios suficientes'
		})
	}

	next()
}

/**
 * Valida que exista el header merchantId
 */
export function hasMerchantId(req: Request, res: Response, next: NextFunction): Response | void {
	const merchantId = req.header('merchantId')
	if (!merchantId) {
		return res.status(400).send({
			message: 'Missing header `merchantId`'
		})
	}

	next()
}
