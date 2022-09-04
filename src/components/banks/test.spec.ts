import http from 'supertest'

import { app } from '../../app'

let token: string
let session: string

beforeAll((done) => {
	http(app)
		.post('/auth/login')
		.send({
			email: 'user@test.com',
			password: '123456'
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

describe('Banks', () => {
	describe('GET /banks', () => {
		it('Deberia obtener una lista con todos los bancos', (done) => {
			http(app)
				.get('/banks')
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
