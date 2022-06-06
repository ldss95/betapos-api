import { Router } from 'express'

import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'
const router: Router = Router()

router.get('/', isLoggedin, tokenIsValid, controller.getAll)

export default router
