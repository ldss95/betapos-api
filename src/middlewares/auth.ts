import { NextFunction, Response, Request } from 'express'
import jwt from 'jsonwebtoken'

/**
 * Verifica si hay una sesion iniciada, de lo contrario devuelve un estado 401
 */
function isLoggedin(req: Request, res: Response, next: NextFunction): void {
	if (req.session?.loggedin) {
		return next()
	}

	res.status(401).send({
		message: 'Ninguna sesion iniciada',
	})
}

/**
 * Verifica que el usuario logueado tenga los permisos necesarios.
 * De lo contrario devuelve un estado 403
 */
function havePermissions(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	if (req && res) {
		next()
	}
}

/**
 * Verifica si hay token y es valido, de lo contrario devuelve un estado 403
 */
function tokenIsValid(req: Request, res: Response, next: NextFunction): void {
	const bearerHeader = req.headers.authorization

	if (!bearerHeader) {
		res.status(401).send({
			message: 'No se encontro el token',
		})
		return
	}

	const bearer = bearerHeader.split(' ')
	const token = bearer[1]

	jwt.verify(token, process.env.SECRET_TOKEN || '', (error) => {
		if (error) {
			res.status(401).send({
				message: 'Token invalido',
			})
			return
		}

		next()
	})
}

export { isLoggedin, havePermissions, tokenIsValid }
