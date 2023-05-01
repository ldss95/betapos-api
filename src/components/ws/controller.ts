import { Request, Response } from 'express'

import WsClient from '../../ws'

export default {
	getQr: (req: Request, res: Response) => {
		const { merchantId, businessId } = req.session!
		const ws = WsClient.getInstance(merchantId, businessId)
		if (ws.qr) {
			return res.status(200).send(ws.qr)
		}

		ws.client.on('qr', (qr) => res.status(200).send(qr))
	}
}
