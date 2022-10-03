import http from 'supertest'

import { app } from '../../app'

describe('Barcodes', () => {
	describe('GET /barcodes/updates/:date', () => {
		it('Deberia obtener una lista con los codigos de barra que han sido creados o modificados despues de la fecha seleccionada', async () => {
			const { body } = await http(app)
				.get('/barcodes/updates/2022-01-01 08:00:00')
				.set('merchantId', process.env.TEST_MERCHANT_ID!)
				.expect(200)

			expect(body).toHaveProperty('created')
			expect(body).toHaveProperty('updated')
			expect(body.created).toBeInstanceOf(Array)
			expect(body.updated).toBeInstanceOf(Array)
		})

		it('Deberia fallar por falta de header merchantId', async () => {
			await http(app)
				.get('/barcodes/updates/2022-01-01 08:00:00')
				.expect(400)
		})

		it('Deberia fallar por merchantId erroneo', async () => {
			await http(app)
				.get('/barcodes/updates/2022-01-01 08:00:00')
				.set('merchantId', '000000')
				.expect(400)
		})

		it('Deberia fallar por empresa desabilitada', async () => {
			await http(app)
				.get('/barcodes/updates/2022-01-01 08:00:00')
				.set('merchantId', 'LQ734298')
				.expect(400)
		})
	})
})
