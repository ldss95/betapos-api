import { Router } from 'express'
const router: Router = Router()

import { isLoggedIn, tokenIsValid, isAdmin } from '../../middlewares/auth'
import controller from './controller'

router.get('/', isLoggedIn, tokenIsValid, isAdmin, controller.getAll)

export default router
