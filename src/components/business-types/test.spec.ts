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

describe('Business Types', () => {
	describe('GET /business-types', () => {
		it('Deberia obtener una lista con los tipos de empresas', (done) => {
			http(app)
				.get('/business-types')
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
