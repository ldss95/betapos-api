import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { uploadSingle } from '../../middlewares/files'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'

routes
	.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, controller.create)
	.put(isLoggedin, tokenIsValid, controller.update)

routes.get('/updates/:date', controller.getUpdates)
routes.get('/transactions/:id', isLoggedin, tokenIsValid, controller.getTransactions)

routes
	.route('/:id')
	.get(isLoggedin, tokenIsValid, controller.getOne)
	.delete(isLoggedin, tokenIsValid, controller.delete)

routes.post('/photo', isLoggedin, tokenIsValid, uploadSingle('images/products/'), controller.addPhoto)

export default routes
