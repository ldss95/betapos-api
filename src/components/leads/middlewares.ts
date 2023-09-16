import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

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

const LeadSchema = z.object({
	name: z.string().optional().nullable(),
	businessName: z.string().optional().nullable(),
	businessTypeId: z.string().uuid(),
	latitude: z.number(),
	longitude: z.number(),
	address: z.string().optional().nullable(),
	provinceId: z.string().uuid(),
	conversionProbability: z.number().min(0).max(5),
	phone: z.string().optional().nullable(),
	email: z.string().email().optional().nullable()
})

export function validateNewLead(req: Request, res: Response, next: NextFunction) {
	LeadSchema.parse(req.body)
	next()
}
