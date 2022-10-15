import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { hasMerchantId, isLoggedin, tokenIsValid } from '../../middlewares/auth'
import { validateNewComputingScale, validateUpdateComputingScale } from './middlewares'

routes
	.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, validateNewComputingScale, controller.create)
	.put(isLoggedin, tokenIsValid, validateUpdateComputingScale, controller.update)

routes.get('/updates/:date', hasMerchantId, controller.getUpdates)

routes.delete('/:id', isLoggedin, tokenIsValid, controller.delete)

export default routes
