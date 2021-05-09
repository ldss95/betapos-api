import http from 'supertest'

import { app } from '../../app'

describe('Auth', () => {
	describe('POST /auth/login', () => {
		it('Deberia iniciar sesion', done => {
			http(app)
				.post('/auth/login')
				.send({ email: 'user@test.com', password: '123456' })
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveProperty('token')
					expect(body).toHaveProperty('user')
					expect(body.user).toHaveProperty('firstName')
					expect(body.user).toHaveProperty('lastName')
					expect(body.user).toHaveProperty('email')
					expect(body.user).toHaveProperty('roleId')

					done()
				}).catch(error => done(error))
		})

		it('Deberia fallar por email incorrecto', done => {
			http(app)
				.post('/auth/login')
				.send({ email: 'incorrect@email.com', password: '123456' })
				.expect(401)
				.then(({ body }) => {
					expect(body).toHaveProperty('message')
					expect(body.message).toBe('Email incorrecto.')

					done()
				}).catch(error => done(error))
		})

		it('Deberia fallar por contraseña incorrecta', done => {
			http(app)
				.post('/auth/login')
				.send({ email: 'user@test.com', password: '12345655' })
				.expect(401)
				.then(({ body }) => {
					expect(body).toHaveProperty('message')
					expect(body.message).toBe('Contraseña incorrecta.')

					done()
				}).catch(error => done(error))
		})
	})
})