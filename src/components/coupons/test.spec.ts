import http from 'supertest'

import { app } from '../../app'

let token: string;
let session: any;

beforeAll(done => {
	http(app)
		.post('/auth/login')
		.send({
			email: 'user@test.com',
			password: '123456'
		}).then(res => {
			token = res.body.token;

			session = res
				.headers['set-cookie'][0]
				.split(',')
				.map((item: any) => item.split(';')[0])
				.join(';')
			
			done()
		}).catch(error => done(error))
})

describe('Coupons', () => {
	describe('POST /coupons', () => {
		it('Deberia crear un cupon', done => {
			http(app)
				.post('/coupons')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.send({
					type: 'AMOUNT',
					value: 200,
					code: 'MONTATE'
				}).expect(201, done)
		})
	})

	describe('GET /coupons', () => {
		it('Deberia obtener un array con todos los cupones', done => {
			http(app)
				.get('/coupons')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(200, done)
		})
	})
})