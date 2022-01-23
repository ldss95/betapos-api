import http from 'supertest'

import { app } from '../../app'

let roleId: string
let token: string
let session: string

const role = {
	name: 'Rol de pruebas',
	description: 'Este rol es creado por los tests unitarios, deberia ser eliminado automaticamente'
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

describe('Roles', () => {
	describe('POST /roles', () => {
		it('Crea un rol', (done) => {
			http(app)
				.post('/roles')
				.send(role)
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(201)
				.then((res) => {
					roleId = res.body.id
					done()
				})
				.catch((error) => done(error))
		})

		it('Deberia fallar por nombre duplicado', (done) => {
			http(app)
				.post('/roles')
				.send(role)
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(400, done)
		})
	})

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

	describe('GET /roles/:id', () => {
		it('Deberia obtener un objeto con 1 rol', (done) => {
			http(app)
				.get(`/roles/${roleId}`)
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect('Content-Type', /json/)
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveProperty('id')
					expect(body).toHaveProperty('name')
					expect(body).toHaveProperty('description')

					done()
				})
		})

		it('Deberia obtener 404 al intentar obtener los datos de un rol inexistente', (done) => {
			http(app)
				.get('/roles/inexistent-role')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(404, done)
		})
	})

	describe('PUT /roles', () => {
		it('Deberia actualizar el nombre del rol creado', (done) => {
			http(app)
				.put('/roles')
				.send({
					name: 'Rol de pruebas (Actualizado)',
					description:
						'Este rol es creado por los tests unitarios, deberia ser eliminado automaticamente (Actualizado)',
					id: roleId
				})
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(204, done)
		})

		it('Deberia fallar al intentar actualizar rol inexistente', (done) => {
			http(app)
				.put('/users')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.send({
					name: 'Rol de pruebas (Falla - Actualizar)',
					descrption:
						'Este rol es creado por los tests unitarios, deberia ser eliminado automaticamente (Falla - Actualizar)',
					id: 'inexistent-role'
				})
				.expect(404, done)
		})
	})

	describe('DELETE /roles', () => {
		it('Deberia eliminar el rol creado para los tests', (done) => {
			http(app)
				.delete(`/roles/${roleId}`)
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(204, done)
		})

		it('Deberia devolver 404 al intentar eliminar un rol que no existe', (done) => {
			http(app)
				.delete('/roles/inexistent-user')
				.set('Authorization', `Bearer ${token}`)
				.set('Cookie', session)
				.expect(404, done)
		})
	})
})
