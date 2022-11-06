import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { uploadSingle } from '../../middlewares/files'
import { isLoggedIn, tokenIsValid, hasMerchantId } from '../../middlewares/auth'
import { validateCreateProduct, validateTableRequest } from './middlewares'

routes
	.route('/')
	.post(isLoggedIn, tokenIsValid, validateCreateProduct, controller.create)
	.put(isLoggedIn, tokenIsValid, controller.update)

routes.get('/updates/:date', hasMerchantId, controller.getUpdates)
routes.get('/transactions/:id', isLoggedIn, tokenIsValid, controller.getTransactions)

routes
	.route('/:id')
	.get(isLoggedIn, tokenIsValid, controller.getOne)
	.delete(isLoggedIn, tokenIsValid, controller.delete)

routes.post('/photo', isLoggedIn, tokenIsValid, uploadSingle('images/products/'), controller.addPhoto)
routes.get('/export/:type', isLoggedIn, tokenIsValid, controller.export)
routes.post('/table', isLoggedIn, tokenIsValid, validateTableRequest, controller.getAll)

routes.get('/find-by-barcode/:barcode', isLoggedIn, tokenIsValid, controller.findByBarcode)

export default routes
