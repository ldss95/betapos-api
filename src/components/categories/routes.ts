import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'

routes
	.route('/')
	.get(isLoggedIn, tokenIsValid, controller.getAll)
	.post(isLoggedIn, tokenIsValid, controller.create)
	.put(isLoggedIn, tokenIsValid, controller.update)

routes.get('/business/:businessId', controller.getCategoriesByBusiness)

routes
	.route('/:id')
	.get(isLoggedIn, tokenIsValid, controller.getOne)
	.delete(isLoggedIn, tokenIsValid, controller.delete)

export default routes
