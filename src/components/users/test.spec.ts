import http from 'supertest'

import { app } from '../../app'
import { login4Tests } from '../../helpers'

let userId: string

const user = {
	firstName: 'Test First Name',
	lastName: 'Test Last Name',
	birthDate: '1995-08-10',
	email: 'test@test.com',
	password: '123456',
	gender: 'M',
	dui: '40225688353',
	roleId: process.env.ADMIN_ROLE_ID
}

const session = {
	token: '',
	session: ''
}

beforeEach(async () => await login4Tests(app, session))

describe('Users', () => {
	describe('POST /users', () => {
		it('Crea usuario', async () => {
			const { body } = await http(app)
				.post('/users')
				.send(user)
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(201)

			userId = body.id
		})

		it('Deberia fallar por email duplicado', async () => {
			await http(app)
				.post('/users')
				.send(user)
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(400)
		})

		it('Deberia fallar por cedula duplicada', async () => {
			await http(app)
				.post('/users')
				.send({ ...user, email: 'other@email.com' })
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(400)
		})

		it('Deberia fallar por cedula invalida', async () => {
			await http(app)
				.post('/users')
				.send({ ...user, email: 'other@email.com', dui: '40225688242' })
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(400)
		})
	})

	describe('GET /users', () => {
		it('Deberia obtener un array con todos los usuarios', async () => {
			await http(app)
				.get('/users')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect('Content-Type', /json/)
				.expect(200)
		})
	})

	describe('GET /users/:id', () => {
		it('Deberia obtener un objeto con 1 usuario', async () => {
			const { body } = await http(app)
				.get(`/users/${userId}`)
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect('Content-Type', /json/)
				.expect(200)

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
		}, 10000)

		it('Deberia obtener un error 404 al intentar obtener los datos de un usuario inexistente', async () => {
			await http(app)
				.get('/users/inexistent-user')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(404)
		})
	})

	describe('PUT /users', () => {
		it('Deberia actualizar el nombre del usuario creado', async () => {
			await http(app)
				.put('/users')
				.send({
					firstName: 'Update First Name',
					id: userId
				})
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(204)
		})

		it('Deberia fallar al intentar actualizar usuario inexistente', async () => {
			http(app)
				.put('/users')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.send({
					firstName: 'Update First Name',
					id: 'inexistent-user'
				})
				.expect(404)
		})
	})

	describe('DELETE /users', () => {
		it('Deberia eliminar el usuario creado para los tests', async () => {
			await http(app)
				.delete(`/users/${userId}`)
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.send({
					force: true
				})
				.expect(204)
		})

		it('Deberia devolver 204 al intentar eliminar un usuario que no existe', async () => {
			await http(app)
				.delete('/users/inexistent-user')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(204)
		})
	})
})
