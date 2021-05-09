import { Router } from 'express'
const router: Router = Router()

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'

router.post('/login', controller.login)
router.post('/logout', isLoggedin, tokenIsValid, controller.logout)

export default router