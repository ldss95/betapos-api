import { Router } from 'express'
const routes: Router = Router()

import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import { uploadSingle } from '../../middlewares/files'
import controller from './controller'

routes.get('/updates/:date', controller.getUpdates)

routes
	.route('/')
	.get(isLoggedIn, tokenIsValid, controller.getAll)
	.post(isLoggedIn, tokenIsValid, controller.create)
	.put(isLoggedIn, tokenIsValid, controller.update)

routes.get('/pending', isLoggedIn, tokenIsValid, controller.getPending)
routes.get('/pending-details/:clientId', isLoggedIn, tokenIsValid, controller.getPendingDetails)
routes.get('/available-credit/:id', controller.getAvailableCredit)

routes
	.route('/:id')
	.get(isLoggedIn, tokenIsValid, controller.getOne)
	.delete(isLoggedIn, tokenIsValid, controller.delete)

routes.post('/photo', isLoggedIn, tokenIsValid, uploadSingle('images/clients/'), controller.addPhoto)

export default routes
