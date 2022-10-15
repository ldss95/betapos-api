import moment from 'moment'
import http from 'supertest'
import fs from 'fs'
import path from 'path'

import { app } from '../../app'
import { login4Tests } from '../../helpers'
import { PurchaseProps } from './interface'

const session = {
	token: '',
	session: ''
}
const TEST_PURCHASE_ID = '56d5de0c-c3df-4fa3-96d0-4d3d781ebeac'
const TEST_PROVIDER_ID = '0319da94-d62b-4460-a320-5b8acc4c8f38' // Coca Cola

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
			expect(purchase).toHaveProperty('payed')
			expect(typeof purchase.payed).toBe('boolean')
			expect(purchase).toHaveProperty('amount')
			expect(typeof purchase.amount).toBe('number')
			expect(purchase).toHaveProperty('date')
			expect(typeof purchase.date).toBe('string')
			expect(purchase).toHaveProperty('adjustPrices')
			expect(typeof purchase.adjustPrices).toBe('boolean')
			expect(purchase).toHaveProperty('userId')
			expect(typeof purchase.userId).toBe('string')
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

	describe('PUT /purchases', () => {
		it('Deberaia fallar al modificar compra por no tener sesion iniciada', async () => {
			await http(app)
				.put('/purchases')
				.expect(401)
		})

		it('Deberaia fallar al modificar compra por falta de token', async () => {
			await http(app)
				.put('/purchases')
				.set('Cookie', session.session)
				.expect(401)
		})

		it('Deberaia fallar al modificar una nueva factura por cuerpo incorrecto', async () => {
			await http(app)
				.put('/purchases')
				.send({ })
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(400)
		})

		it('Deberaia modificar una factura', async () => {
			const data = {
				id: TEST_PURCHASE_ID,
				providerId: TEST_PROVIDER_ID,
				documentId: `${Math.floor(Math.round(Math.random() * (0 - 999999) + 999999))}`,
				paymentType: 'CREDIT',
				affectsExistence: false,
				amount: Math.floor(Math.round(Math.random() * (0 - 999999) + 999999)),
				date: moment().format('YYYY-MM-DD'),
				adjustPrices: false
			}

			await http(app)
				.put('/purchases')
				.send(data)
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(204)

			const { body } = await http(app)
				.get('/purchases/' + data.id)
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(200)

			expect(body.documentId).toBe(data.documentId)
			expect(body.amount).toBe(data.amount)
			expect(body.date).toBe(data.date)
		})
	})

	describe('PUT /purchases/file/:id', () => {
		it('Deberaia fallar al subir archivo de compras por no tener sesion iniciada', async () => {
			await http(app)
				.put('/purchases/file/' + TEST_PURCHASE_ID)
				.expect(401)
		})

		it('Deberaia fallar al subir archivo de compras por falta de token', async () => {
			await http(app)
				.put('/purchases/file/' + TEST_PURCHASE_ID)
				.set('Cookie', session.session)
				.expect(401)
		})

		it('Deberaia fallar al subir archivo de compras por no adjunsta ningun archivo', async () => {
			await http(app)
				.put('/purchases/file/' + TEST_PURCHASE_ID)
				.set('Cookie', session.session)
				.set('Authorization', `Bearer ${session.token}`)
				.field('id', TEST_PURCHASE_ID)
				.expect(400)
		})

		const file = fs.readFileSync(path.join(__dirname, '../../assets/ZECONOMY GUIA CAJERO.pdf'))

		it('Deberaia subir archivo de compra', async () => {
			await http(app)
				.put('/purchases/file/' + TEST_PURCHASE_ID)
				.set('Cookie', session.session)
				.set('Authorization', `Bearer ${session.token}`)
				.attach('file', file, 'Invoice.pdf')
				.expect(204)

			const { body } = await http(app)
				.get('/purchases/' + TEST_PURCHASE_ID)
				.set('Cookie', session.session)
				.set('Authorization', `Bearer ${session.token}`)
				.expect(200)

			expect(typeof body.fileUrl).toBe('string')
			expect(body.fileUrl.includes('https://files.betapos.com.do')).toBe(true)
		})
	})

	describe('DELETE /purchases/file/:id', () => {
		it('Deberaia fallar al eliminar archivo de compras por no tener sesion iniciada', async () => {
			await http(app)
				.delete('/purchases/file/' + TEST_PURCHASE_ID)
				.expect(401)
		})

		it('Deberaia fallar al eliminar archivo de compras por falta de token', async () => {
			await http(app)
				.delete('/purchases/file/' + TEST_PURCHASE_ID)
				.set('Cookie', session.session)
				.expect(401)
		})

		it('Deberaia eliminar archivo de compra', async () => {
			await http(app)
				.delete('/purchases/file/' + TEST_PURCHASE_ID)
				.set('Cookie', session.session)
				.set('Authorization', `Bearer ${session.token}`)
				.expect(204)

			const { body } = await http(app)
				.get('/purchases/' + TEST_PURCHASE_ID)
				.set('Cookie', session.session)
				.set('Authorization', `Bearer ${session.token}`)
				.expect(200)

			expect(body.fileUrl).toBe(null)
		})
	})

	describe('GET /purchases/:id', () => {
		it('Deberaia obtener una compras por el id dado', async () => {
			const { body } = await http(app)
				.get('/purchases/' + TEST_PURCHASE_ID)
				.set('Authorization', `Bearer ${session.token}`)
				.set('Cookie', session.session)
				.expect(200)

			expect(body).toBeInstanceOf(Object)

			expect(body).toHaveProperty('id')
			expect(typeof body.id).toBe('string')
			expect(body).toHaveProperty('businessId')
			expect(typeof body.businessId).toBe('string')
			expect(body).toHaveProperty('providerId')
			expect(typeof body.providerId).toBe('string')
			expect(body).toHaveProperty('provider')
			expect(body.provider).toBeInstanceOf(Object)
			expect(body).toHaveProperty('documentId')
			expect(typeof body.documentId).toBe('string')
			expect(body).toHaveProperty('paymentType')
			expect(body).toHaveProperty('products')
			expect(body.products).toBeInstanceOf(Array)
			expect(typeof body.paymentType).toBe('string')
			expect(['IMMEDIATE', 'CREDIT']).toContain(body.paymentType)
			if (body.paymentType == 'CREDIT') {
				expect(body).toHaveProperty('creditDays')
				expect(typeof body.creditDays).toBe('number')
				expect(body).toHaveProperty('deadline')
				expect(typeof body.deadline).toBe('string')
			}
			expect(body).toHaveProperty('affectsExistence')
			expect(typeof body.affectsExistence).toBe('boolean')
			expect(body).toHaveProperty('fileUrl')
			expect(body).toHaveProperty('payed')
			expect(typeof body.payed).toBe('boolean')
			expect(body).toHaveProperty('amount')
			expect(typeof body.amount).toBe('number')
			expect(body).toHaveProperty('date')
			expect(typeof body.date).toBe('string')
			expect(body).toHaveProperty('adjustPrices')
			expect(typeof body.adjustPrices).toBe('boolean')
			expect(body).toHaveProperty('createdAt')
			expect(typeof body.createdAt).toBe('string')
			expect(body).toHaveProperty('updatedAt')
			expect(typeof body.updatedAt).toBe('string')
		})

		it('Deberaia fallar al obtener lista de compras por no tener sesion iniciada', async () => {
			await http(app)
				.get('/purchases/' + TEST_PURCHASE_ID)
				.expect(401)
		})

		it('Deberaia fallar al obtener lista de compras por falta de token', async () => {
			await http(app)
				.get('/purchases/' + TEST_PURCHASE_ID)
				.set('Cookie', session.session)
				.expect(401)
		})
	})

	describe('PUT /purchase/pay/:id', () => {
		it('Deberaia fallar pagar compras por no tener sesion iniciada', async () => {
			await http(app)
				.put('/purchases/pay/' + TEST_PURCHASE_ID)
				.send()
				.expect(401)
		})

		it('Deberaia fallar al pagar compras por falta de token', async () => {
			await http(app)
				.put('/purchases/pay/' + TEST_PURCHASE_ID)
				.set('Cookie', session.session)
				.expect(401)
		})

		it('Deberaia marcar compra como pagada', async () => {
			const { body: purchases } = await http(app)
				.get('/purchases')
				.set('Cookie', session.session)
				.set('Authorization', `Bearer ${session.token}`)
				.expect(200)

			const purchase = purchases.find(({ payed }: PurchaseProps) => !payed)

			await http(app)
				.put('/purchases/pay/' + purchase.id)
				.set('Cookie', session.session)
				.set('Authorization', `Bearer ${session.token}`)
				.expect(204)

			const { body } = await http(app)
				.get('/purchases/' + purchase.id)
				.set('Cookie', session.session)
				.set('Authorization', `Bearer ${session.token}`)
				.expect(200)

			expect(body.payed).toBe(true)
		})
	})
})
