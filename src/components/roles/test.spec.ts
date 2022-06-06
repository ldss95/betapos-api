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

describe('Roles', () => {
	describe('GET /roles', () => {
		it('Deberia obtener un array con todos los roles', (done) => {
			http(app)
				.get('/roles')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect('Content-Type', /json/)
				.expect(200, done)
		})
	})
})
