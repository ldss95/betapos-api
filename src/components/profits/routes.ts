import { Router } from 'express'

import controller from './controller'
import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
const router: Router = Router()

router.get('/', isLoggedIn, tokenIsValid, controller.getAll)

export default router
