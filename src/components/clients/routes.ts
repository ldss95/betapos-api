import { Router } from 'express'
const routes: Router = Router()

import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes
	.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, controller.create)
	.put(isLoggedin, tokenIsValid, controller.update)

routes
	.route('/:id')
	.get(isLoggedin, tokenIsValid, controller.getOne)
	.delete(isLoggedin, tokenIsValid, controller.delete)

export default routes
