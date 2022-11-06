import { Router } from 'express'

import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'
const router: Router = Router()

router.get('/', isLoggedIn, tokenIsValid, controller.getAll)

export default router
