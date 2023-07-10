import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { isLoggedIn, tokenIsValid, isBusinessAdmin } from '../../middlewares/auth'

routes.route('/')
	.post(isLoggedIn, tokenIsValid, isBusinessAdmin, controller.startInventory)
	.get(isLoggedIn, tokenIsValid, isBusinessAdmin, controller.getAll)

routes.put('/finish/:id', isLoggedIn, tokenIsValid, isBusinessAdmin, controller.finish)
routes.put('/modify-count/', isLoggedIn, tokenIsValid, isBusinessAdmin, controller.modifyProductCount)
routes.post('/add-product-count/', isLoggedIn, tokenIsValid, isBusinessAdmin, controller.addProductCount2Inventory)

routes.route('/:id')
	.get(isLoggedIn, tokenIsValid, controller.getOne)


export default routes
