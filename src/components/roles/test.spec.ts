import http from 'supertest'

import { app } from '../../app'
import { login4Tests } from '../../helpers'

const session = {
	token: '',
	session: ''
}

beforeEach(async () => await login4Tests(app, session))

describe('Roles', () => {
	describe('GET /roles', () => {
		it('Deberia obtener un array con todos los roles', async () => {
			await http(app)
				.get('/roles')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect('Content-Type', /json/)
				.expect(200)
		})
	})
})
