import { Router } from 'express'

import controller from './controller'
import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
const router: Router = Router()

router
	.route('/')
	.get(isLoggedIn, tokenIsValid, controller.getAll)
	.post(isLoggedIn, tokenIsValid, controller.create)
	.put(isLoggedIn, tokenIsValid, controller.update)

router.delete('/:id', isLoggedIn, tokenIsValid, controller.delete)

export default router
