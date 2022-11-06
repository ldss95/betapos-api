import { Router } from 'express'
const routes: Router = Router()

import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes
	.route('/')
	.post(controller.create)
	.get(isLoggedIn, tokenIsValid, controller.getAll)
	.put(isLoggedIn, tokenIsValid, controller.update)

routes.get('/updates/:date', controller.getUpdates)

routes.route('/:id').delete(controller.delete)

export default routes
