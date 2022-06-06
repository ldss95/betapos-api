import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'

const routes: Router = Router()

routes
	.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, controller.create)
	.put(isLoggedin, tokenIsValid, controller.update)

routes.get('/status-list', isLoggedin, tokenIsValid, controller.statusList)

routes
	.route('/:id')
	.get(isLoggedin, tokenIsValid, controller.getOne)
	.delete(isLoggedin, tokenIsValid, controller.delete)

export default routes
