import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { validateCreateBrand, validateUpdateBrand } from './middlewares'
import { isLoggedin, tokenIsValid, isBusinessAdmin } from '../../middlewares/auth'

routes
	.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, isBusinessAdmin, validateCreateBrand, controller.create)
	.put(isLoggedin, tokenIsValid, isBusinessAdmin, validateUpdateBrand, controller.update)

routes
	.route('/:id')
	.get(isLoggedin, tokenIsValid, controller.getOne)
	.delete(isLoggedin, tokenIsValid, isBusinessAdmin, controller.delete)

export default routes
