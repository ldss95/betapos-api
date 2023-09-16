import { NextFunction, Request, Response } from 'express'

import { RoleCode } from '../roles/interface'

export function canGetLeads(req: Request, res: Response, next: NextFunction) {
	const role = req.session!.roleCode as RoleCode

	if (role != 'ADMIN' && role != 'PARTNER') {
		return res.status(403).send({
			message: 'No posee privilegios suficientes'
		})
	}

	next()
}
