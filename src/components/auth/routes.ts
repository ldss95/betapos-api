import { Router } from 'express'
const router: Router = Router()

import controller from './controller'
import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import { validLogin, validChangePassword, validSignup } from './middlewares'

router.post('/login', validLogin, controller.login)
router.post('/signup', validSignup, controller.signup)
router.post('/logout', controller.logout)
router.get('/current-session', controller.getCurrentSession)
router.post('/change-password', isLoggedIn, tokenIsValid, validChangePassword, controller.changePassword)

export default router
