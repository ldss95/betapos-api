import http from 'supertest'

import { app } from '../../app'
import { login4Tests } from '../../helpers'

const session = {
	token: '',
	session: ''
}

beforeEach(async () => await login4Tests(app, session))

describe('Coupons', () => {
	describe('POST /coupons', () => {
		it('Deberia crear un cupon', async () => {
			await http(app)
				.post('/coupons')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.send({
					type: 'AMOUNT',
					value: 200,
					code: 'MONTATE'
				})
				.expect(201)
		})
	})

	describe('GET /coupons', () => {
		it('Deberia obtener un array con todos los cupones', async () => {
			await http(app)
				.get('/coupons')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(200)
		})
	})
})
