import http from 'supertest'

import { app } from '../../app'

let userId: string
let token: string
let session: string

const user = {
	firstName: 'Test First Name',
	lastName: 'Last First Name',
	birthDate: '1995-08-10',
	email: 'test@test.com',
	password: '123456',
	dui: '40225688353',
	roleId: 1
}

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

describe('Users', () => {
	describe('POST /users', () => {
		it('Crea usuario', (done) => {
			http(app)
				.post('/users')
				.send(user)
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(201)
				.then((res) => {
					userId = res.body.id
					done()
				})
				.catch((error) => done(error))
		})

		it('Deberia fallar por email duplicado', (done) => {
			http(app)
				.post('/users')
				.send(user)
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(400, done)
		})

		it('Deberia fallar por cedula duplicada', (done) => {
			http(app)
				.post('/users')
				.send({ ...user, email: 'other@email.com' })
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(400, done)
		})

		it('Deberia fallar por cedula invalida', (done) => {
			http(app)
				.post('/users')
				.send({ ...user, email: 'other@email.com', dui: '40225688242' })
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(400, done)
		})
	})

	describe('GET /users', () => {
		it('Deberia obtener un array con todos los usuarios', (done) => {
			http(app)
				.get('/users')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect('Content-Type', /json/)
				.expect(200, done)
		})
	})

	describe('GET /users/:id', () => {
		it('Deberia obtener un objeto con 1 usuario', (done) => {
			http(app)
				.get(`/users/${userId}`)
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect('Content-Type', /json/)
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveProperty('id')
					expect(body).toHaveProperty('firstName')
					expect(body).toHaveProperty('lastName')
					expect(body).toHaveProperty('birthDate')
					expect(body).toHaveProperty('email')
					expect(body).toHaveProperty('dui')
					expect(body).toHaveProperty('address')
					expect(body).toHaveProperty('photoUrl')
					expect(body).toHaveProperty('businessId')
					expect(body).toHaveProperty('isActive')
					expect(body).toHaveProperty('createdAt')
					expect(body).toHaveProperty('updatedAt')

					expect(body).not.toHaveProperty('password')

					done()
				})
		})

		it('Deberia obtener un error 404 al intentar obtener los datos de un usuario inexistente', (done) => {
			http(app)
				.get('/users/inexistent-user')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(404, done)
		})
	})

	describe('PUT /users', () => {
		it('Deberia actualizar el nombre del usuario creado', (done) => {
			http(app)
				.put('/users')
				.send({
					firstName: 'Update First Name',
					id: userId
				})
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(204, done)
		})

		it('Deberia fallar al intentar actualizar usuario inexistente', (done) => {
			http(app)
				.put('/users')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.send({
					firstName: 'Update First Name',
					id: 'inexistent-user'
				})
				.expect(404, done)
		})
	})

	describe('DELETE /users', () => {
		it('Deberia eliminar el usuario creado para los tests', (done) => {
			http(app)
				.delete(`/users/${userId}`)
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(204, done)
		})

		it('Deberia devolver 404 al intentar eliminar un usuario que no existe', (done) => {
			http(app)
				.delete('/users/inexistent-user')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(404, done)
		})
	})
})
