import { Router } from 'express'
const routes: Router = Router()

import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes
	.route('/')
	.post(controller.create)
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.put(isLoggedin, tokenIsValid, controller.update)

routes.get('/updates/:date', controller.getUpdates)

routes.route('/:id').delete(controller.delete)

export default routes
