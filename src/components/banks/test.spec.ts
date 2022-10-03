import http from 'supertest'

import { app } from '../../app'
import { login4Tests } from '../../helpers'

const session = {
	token: '',
	session: ''
}

beforeEach(async () => await login4Tests(app, session))

describe('Banks', () => {
	describe('GET /banks', () => {
		it('Deberia obtener una lista con todos los bancos', async () => {
			const { body } = await http(app)
				.get('/banks')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(200)

			expect(body.length).toBeGreaterThan(0)
		})
	})
})
