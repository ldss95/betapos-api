import { Request, Response, NextFunction } from 'express'
import WsClient from '../../ws'

export default {
	getQr: (req: Request, res: Response, next: NextFunction) => {
		try {
			const { merchantId, businessId } = req.session!
			const ws = WsClient.getInstance(merchantId, businessId)
			if (ws.qr) {
				return res.status(200).send(ws.qr)
			}

			ws.client.on('qr', (qr) => res.status(200).send(qr))
		} catch (error) {
			res.status(500).send(error)
			next(error)
		}
	}
}
