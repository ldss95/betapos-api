import http from 'supertest'

import { app } from '../../app'

describe('Auth', () => {
	describe('POST /auth/login', () => {
		it('Deberia iniciar sesion', async () => {
			const { body } = await http(app)
				.post('/auth/login')
				.send({ email: 'lsantiago@pixnabilab.com', password: '123456' })
				.expect(200)

			expect(body).toHaveProperty('token')
			expect(body).toHaveProperty('user')
			expect(body.user).toHaveProperty('firstName')
			expect(body.user).toHaveProperty('lastName')
			expect(body.user).toHaveProperty('email')
			expect(body.user).toHaveProperty('roleId')
		})

		it('Deberia fallar por email incorrecto', async () => {
			const { body } = await http(app)
				.post('/auth/login')
				.send({ email: 'incorrect@email.com', password: '123456' })
				.expect(401)

			expect(body).toHaveProperty('message')
			expect(body.message).toBe('Email o contraseña incorrecta.')
		})

		it('Deberia fallar por contraseña incorrecta', async () => {
			const { body } = await http(app)
				.post('/auth/login')
				.send({ email: 'lsantiago@pixnabilab.com', password: '-----' })
				.expect(401)

			expect(body).toHaveProperty('message')
			expect(body.message).toBe('Email o contraseña incorrecta.')
		})
	})
})
