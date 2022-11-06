import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { validateCreateBrand, validateUpdateBrand } from './middlewares'
import { isLoggedIn, tokenIsValid, isBusinessAdmin } from '../../middlewares/auth'

routes
	.route('/')
	.get(isLoggedIn, tokenIsValid, controller.getAll)
	.post(isLoggedIn, tokenIsValid, isBusinessAdmin, validateCreateBrand, controller.create)
	.put(isLoggedIn, tokenIsValid, isBusinessAdmin, validateUpdateBrand, controller.update)

routes
	.route('/:id')
	.get(isLoggedIn, tokenIsValid, controller.getOne)
	.delete(isLoggedIn, tokenIsValid, isBusinessAdmin, controller.delete)

export default routes
