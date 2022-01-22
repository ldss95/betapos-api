import http from 'supertest'

import { app } from '../../app'

let token: string
let session: string

beforeAll((done) => {
	http(app)
		.post('/auth/login')
		.send({
			email: 'user@test.com',
			password: '123456',
		})
		.then((res) => {
			token = res.body.token

			session = res.headers['set-cookie'][0]
				.split(',')
				.map((item: string) => item.split(';')[0])
				.join(';')

			done()
		})
		.catch((error) => done(error))
})

describe('Payment Types', () => {
	describe('GET /payment-types', () => {
		it('Deberia obtener una lista con los tipos de pago', (done) => {
			http(app)
				.get('/payment-types')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(200)
				.then(({ body }) => {
					expect(body.length).toBeGreaterThan(0)
					done()
				})
				.catch((error) => done(error))
		})
	})
})
