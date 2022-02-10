import { Router } from 'express'
const router: Router = Router()

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'

router.post('/login', controller.login)
router.post('/signup', controller.signup)
router.post('/logout', controller.logout)
router.post('/change-password', isLoggedin, tokenIsValid, controller.changePassword)

export default router
