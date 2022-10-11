import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import { validateNewPurchase, validateUpdatePurchase } from './middlewares'
const router: Router = Router()

router.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, validateNewPurchase, controller.create)
	.put(isLoggedin, tokenIsValid, validateUpdatePurchase, controller.update)

router.get('/:id', isLoggedin, tokenIsValid, controller.getOne)

export default router
