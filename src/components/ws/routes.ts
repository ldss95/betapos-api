import { Router } from 'express'
const router: Router = Router()

import { isBusinessAdmin, isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

router.get('/qr', isLoggedIn, tokenIsValid, isBusinessAdmin, controller.getQr)

export default router
