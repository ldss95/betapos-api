import { Router } from 'express'
const router: Router = Router()

import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

router.route('/').post(controller.create).get(isLoggedin, tokenIsValid, controller.getAll)

export default router
