import { Router } from 'express'
const router: Router = Router()

import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

router.route('/').post(controller.create).put(controller.update).get(isLoggedin, tokenIsValid, controller.getAll)

router.get('/sold-details/:shiftId', isLoggedin, tokenIsValid, controller.getSoldDetails)

export default router
