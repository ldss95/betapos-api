import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'

const router: Router = Router()

router.get('/', isLoggedin, tokenIsValid, controller.getAll)

export default router
