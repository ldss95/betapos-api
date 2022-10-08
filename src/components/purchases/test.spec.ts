import moment from 'moment'
import http from 'supertest'

import { app } from '../../app'
import { login4Tests } from '../../helpers'

const session = {
	token: '',
	session: ''
}

beforeEach(async () => await login4Tests(app, session))

describe('Purchases', () => {
	describe('GET /purchases', () => {
		it('Deberaia obtener la lista de compras para el usuario logueado', async () => {
			const { body } = await http(app)
				.get('/purchases')
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(200)

			expect(body).toBeInstanceOf(Array)

			if (body.length == 0) {
				return
			}

			const [purchase] = body
			expect(purchase).toHaveProperty('id')
			expect(typeof purchase.id).toBe('string')
			expect(purchase).toHaveProperty('businessId')
			expect(typeof purchase.businessId).toBe('string')
			expect(purchase).toHaveProperty('providerId')
			expect(typeof purchase.providerId).toBe('string')
			expect(purchase).toHaveProperty('provider')
			expect(purchase.provider).toBeInstanceOf(Object)
			expect(purchase).toHaveProperty('documentId')
			expect(typeof purchase.documentId).toBe('string')
			expect(purchase).toHaveProperty('paymentType')
			expect(typeof purchase.paymentType).toBe('string')
			expect(['IMMEDIATE', 'CREDIT']).toContain(purchase.paymentType)
			if (purchase.paymentType == 'CREDIT') {
				expect(purchase).toHaveProperty('creditDays')
				expect(typeof purchase.creditDays).toBe('number')
				expect(purchase).toHaveProperty('deadline')
				expect(typeof purchase.deadline).toBe('string')
			}
			expect(purchase).toHaveProperty('affectsExistence')
			expect(typeof purchase.affectsExistence).toBe('boolean')
			expect(purchase).toHaveProperty('fileUrl')
			expect(purchase).toHaveProperty('status')
			expect(['DONE', 'IN PROGRESS']).toContain(purchase.status)
			expect(purchase).toHaveProperty('amount')
			expect(typeof purchase.amount).toBe('number')
			expect(purchase).toHaveProperty('date')
			expect(typeof purchase.date).toBe('string')
			expect(purchase).toHaveProperty('adjustPrices')
			expect(typeof purchase.adjustPrices).toBe('boolean')
			expect(purchase).toHaveProperty('createdAt')
			expect(typeof purchase.createdAt).toBe('string')
			expect(purchase).toHaveProperty('updatedAt')
			expect(typeof purchase.updatedAt).toBe('string')
		})

		it('Deberaia fallar al obtener lista de compras por no tener sesion iniciada', async () => {
			await http(app)
				.get('/purchases')
				.expect(401)
		})

		it('Deberaia fallar al obtener lista de compras por falta de token', async () => {
			await http(app)
				.get('/purchases')
				.set('Cookie', session.session)
				.expect(401)
		})
	})

	describe('POST /purchase', () => {
		it('Deberaia fallar al crear compra por no tener sesion iniciada', async () => {
			await http(app)
				.post('/purchases')
				.expect(401)
		})

		it('Deberaia fallar al crear compra por falta de token', async () => {
			await http(app)
				.post('/purchases')
				.set('Cookie', session.session)
				.expect(401)
		})

		it('Deberaia fallar al crear una nueva factura por cuerpo incorrecto', async () => {
			await http(app)
				.post('/purchases')
				.send({ })
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(400)
		})

		it('Deberaia crear una nueva factura y retornar su id', async () => {
			const TEST_PROVIDER_ID = '0319da94-d62b-4460-a320-5b8acc4c8f38' // Coca Cola
			const { body } = await http(app)
				.post('/purchases')
				.send({
					providerId: TEST_PROVIDER_ID,
					documentId: `${Math.floor(Math.round(Math.random() * (0 - 999999) + 999999))}`,
					paymentType: 'CREDIT',
					affectsExistence: false,
					amount: 10000,
					date: moment().format('YYYY-MM-DD'),
					adjustPrices: false
				})
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(201)

			expect(body).toHaveProperty('id')
			expect(typeof body.id).toBe('string')
		})
	})
})
