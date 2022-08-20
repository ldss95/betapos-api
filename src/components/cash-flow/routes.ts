import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'

const router: Router = Router()

router.route('/').get(isLoggedin, tokenIsValid, controller.getAll).post(controller.create)

export default router
