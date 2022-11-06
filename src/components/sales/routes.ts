import { Router } from 'express'

import controller from './controller'
import { isLoggedIn, tokenIsValid, isBusinessAdmin, hasDeviceId, hasMerchantId } from '../../middlewares/auth'

const routes: Router = Router()

routes.route('/')
	.post(hasDeviceId, hasMerchantId, controller.create)
	.put(hasDeviceId, hasMerchantId, controller.update)

routes.post('/get-sales-for-table', isLoggedIn, tokenIsValid, controller.getAll)
routes.delete('/product/:id', controller.removeProduct)
routes.get('/summary/:type', isLoggedIn, tokenIsValid, isBusinessAdmin, controller.getSummary)

routes
	.route('/:id')
	.get(isLoggedIn, tokenIsValid, controller.getOne)
	.delete(isLoggedIn, tokenIsValid, controller.delete)

export default routes
