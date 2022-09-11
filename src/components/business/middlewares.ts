import { Request, Response, NextFunction } from 'express'

export function validateGetAllBusiness(req: Request, res: Response, next: NextFunction): Response | void {
	const { roleCode } = req.session!

	if (['ADMIN', 'PARTNER'].includes(roleCode)) {
		return res.status(403).send({
			message: 'No cuenta con los privilegios necesarios'
		})
	}

	next()
}

export function validateConfirm(req: Request, res: Response, next: NextFunction): Response | void {
	const { merchantId } = req.query
	if (!merchantId) {
		return res.status(400).send({
			message: 'Missing `merchantId`'
		})
	}

	if (merchantId.length != 8) {
		return res.status(400).send({
			message: 'Invalid `merchantId`'
		})
	}

	next()
}
