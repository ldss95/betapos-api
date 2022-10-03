import http from 'supertest'
import { v4 as uuidV4 } from 'uuid'

import { app } from '../../app'
import { login4Tests } from '../../helpers'

const session = {
	token: '',
	session: ''
}

beforeEach(async () => await login4Tests(app, session))

describe('Shifts', () => {
	describe('POST /shifts', () => {
		it('Deberia iniciar y terminar un turno', async () => {
			const id = uuidV4()
			await http(app)
				.post('/shifts')
				.send({
					shift: {
						id,
						userId: process.env.TEST_USER_ID!,
						startAmount: 1000,
						startTime: '08:00:00',
						date: '2022-10-01'
					}
				})
				.set('deviceId', process.env.TEST_DEVICE_ID!)
				.expect(201)

			await http(app)
				.put('/shifts')
				.send({
					shift: {
						id,
						endAmount: 1000,
						endTime: '10:00:00'
					}
				})
				.set('deviceId', process.env.TEST_DEVICE_ID!)
				.expect(204)
		})
	})

	describe('GET /shifts', () => {
		it('Deberia obtener todos los turnos de la empresa del usuario logueado', async () => {
			const { body } = await http(app)
				.get('/shifts')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(200)

			expect(body).toBeInstanceOf(Array)
		})
	})

	describe('GET /shifts/sold-details/:shiftId', () => {
		it('Deberia obtener los totales de ventas por metodos de pago de 1 turno dado', async () => {
			const { body } = await http(app)
				.get('/shifts/sold-details/' + process.env.TEST_SHIFT_ID!)
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(200)

			expect(body).toBeInstanceOf(Array)
			const [item] = body
			expect(item).toHaveProperty('total')
			expect(item).toHaveProperty('paymentType')
			expect(typeof item.total).toBe('number')
			expect(item.paymentType).toBeInstanceOf(Object)
			expect(item.paymentType).toHaveProperty('name')
		})
	})
})
