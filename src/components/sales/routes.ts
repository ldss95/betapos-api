import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid, isBusinessAdmin, hasDeviceId, hasMerchantId } from '../../middlewares/auth'

const routes: Router = Router()

routes.route('/')
	.post(hasDeviceId, hasMerchantId, controller.create)
	.put(hasDeviceId, hasMerchantId, controller.update)

routes.post('/get-sales-for-table', isLoggedin, tokenIsValid, controller.getAll)
routes.delete('/product/:id', controller.removeProduct)
routes.get('/summary/:type', isLoggedin, tokenIsValid, isBusinessAdmin, controller.getSummary)

routes
	.route('/:id')
	.get(isLoggedin, tokenIsValid, controller.getOne)
	.delete(isLoggedin, tokenIsValid, controller.delete)

export default routes
