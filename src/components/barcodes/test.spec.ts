import http from 'supertest'

import { app } from '../../app'

describe('Barcodes', () => {
	describe('GET /barcodes/updates/:date', () => {
		it('Deberia obtener una lista con los codigos de barra que han sido creados o modificados despues de la fecha seleccionada', (done) => {
			http(app)
				.get('/barcodes/updates/2022-01-01 08:00:00')
				.set('merchantId', process.env.TEST_MERCHANT_ID!)
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveProperty('created')
					expect(body).toHaveProperty('updated')
					expect(body.created).toBeInstanceOf(Array)
					expect(body.updated).toBeInstanceOf(Array)

					done()
				})
				.catch((error) => done(error))
		})
	})
})
