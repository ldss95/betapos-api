import { Request, Response, NextFunction } from 'express'

export function inventoryAdjustmentInterceptor(req: Request, res: Response, next: NextFunction) {
	if (req.session!.merchantId === 'DO032100' && req.body.description === 'Ajuste desde la aplicacion movil') {
		req.body.type = 'IN'
	}

	next()
}
