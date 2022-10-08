import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import { validateNewPurchase } from './middlewares'
const router: Router = Router()

router.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, validateNewPurchase, controller.create)

export default router
