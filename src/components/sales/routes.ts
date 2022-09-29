import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid, isBusinessAdmin } from '../../middlewares/auth'

const routes: Router = Router()

routes.route('/').post(controller.create).put(controller.update)

routes.post('/get-sales-for-table', isLoggedin, tokenIsValid, controller.getAll)
routes.delete('/product/:id', controller.removeProduct)
routes.get('/summary', isLoggedin, tokenIsValid, isBusinessAdmin, controller.getSummary)

routes
	.route('/:id')
	.get(isLoggedin, tokenIsValid, controller.getOne)
	.delete(isLoggedin, tokenIsValid, controller.delete)

export default routes
