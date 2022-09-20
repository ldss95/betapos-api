import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { uploadSingle } from '../../middlewares/files'
import { isLoggedin, tokenIsValid, hasMerchantId } from '../../middlewares/auth'
import { validateTableRequest } from './middlewares'

routes.route('/').post(isLoggedin, tokenIsValid, controller.create).put(isLoggedin, tokenIsValid, controller.update)

routes.get('/updates/:date', hasMerchantId, controller.getUpdates)
routes.get('/transactions/:id', isLoggedin, tokenIsValid, controller.getTransactions)

routes
	.route('/:id')
	.get(isLoggedin, tokenIsValid, controller.getOne)
	.delete(isLoggedin, tokenIsValid, controller.delete)

routes.post('/photo', isLoggedin, tokenIsValid, uploadSingle('images/products/'), controller.addPhoto)
routes.post('/export', isLoggedin, tokenIsValid, controller.export)
routes.post('/table', isLoggedin, tokenIsValid, validateTableRequest, controller.getAll)

export default routes
