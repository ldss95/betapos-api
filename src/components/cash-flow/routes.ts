import { Router } from 'express'

import controller from './controller'
import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'

const router: Router = Router()

router.route('/').get(isLoggedIn, tokenIsValid, controller.getAll).post(controller.create)

export default router
