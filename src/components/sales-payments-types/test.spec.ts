import http from 'supertest'

import { app } from '../../app'
import { login4Tests } from '../../helpers'

const session = {
	token: '',
	session: ''
}

beforeEach(async () => await login4Tests(app, session))

describe('Payment Types', () => {
	describe('GET /sales-payment-types', () => {
		it('Deberia obtener una lista con los tipos de pago', async () => {
			const { body } = await http(app)
				.get('/sales-payment-types')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(200)

			expect(body.length).toBeGreaterThan(0)
		})
	})
})
