import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { hasMerchantId, isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import { validateNewComputingScale, validateUpdateComputingScale } from './middlewares'

routes
	.route('/')
	.get(isLoggedIn, tokenIsValid, controller.getAll)
	.post(isLoggedIn, tokenIsValid, validateNewComputingScale, controller.create)
	.put(isLoggedIn, tokenIsValid, validateUpdateComputingScale, controller.update)

routes.get('/updates/:date', hasMerchantId, controller.getUpdates)

routes.delete('/:id', isLoggedIn, tokenIsValid, controller.delete)

export default routes
