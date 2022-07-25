import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'

const routes: Router = Router()

routes.route('/').post(controller.create).put(controller.update)

routes.post('/get-sales-for-table', isLoggedin, tokenIsValid, controller.getAll)
routes.delete('/product/:id', controller.removeProduct)

routes
	.route('/:id')
	.get(isLoggedin, tokenIsValid, controller.getOne)
	.delete(isLoggedin, tokenIsValid, controller.delete)

export default routes
