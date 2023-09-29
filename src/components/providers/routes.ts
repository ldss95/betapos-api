import { Router } from 'express'

import controller from './controller'
import { isBusinessAdmin, isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import { handleCreateError, handleUpdateError } from './middlewares'
const router: Router = Router()

router
	.route('/')
	.get(isLoggedIn, tokenIsValid, controller.getAll)
	.post(isLoggedIn, tokenIsValid, isBusinessAdmin, controller.create, handleCreateError)
	.put(isLoggedIn, tokenIsValid, isBusinessAdmin, controller.update, handleUpdateError)

router.delete('/:id', isLoggedIn, tokenIsValid, controller.delete)

export default router
