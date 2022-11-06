import { Router } from 'express'
const router: Router = Router()

import { hasDeviceId, isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

router.route('/')
	.post(hasDeviceId, controller.create)
	.put(hasDeviceId, controller.update)
	.get(isLoggedIn, tokenIsValid, controller.getAll)

router.get('/sold-details/:shiftId', isLoggedIn, tokenIsValid, controller.getSoldDetails)

export default router
