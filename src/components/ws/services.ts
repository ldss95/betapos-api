import WsClient from '../../ws'
import { Business } from '../business/model'
import { WsSession } from './model'

export async function startAllWsSessions() {
	try {
		console.log('Iniciando sesiones guardadas')
		const sessions = await WsSession.findAll({
			include: {
				model: Business,
				as: 'business'
			}
		})

		if (sessions.length === 0) {
			console.log('🥲 Ninguna sesion guardad')
			return
		}

		for (const session of sessions) {
			console.log('Iniciando sesion de: ', session.business.name)
			const { client } = WsClient.getInstance(
				session.business.merchantId,
				session.businessId
			)
			client.on('ready', () => console.log('Conexion con WS Lista'))
		}
	} catch (error) {
		console.log(JSON.stringify(error))
	}
}
