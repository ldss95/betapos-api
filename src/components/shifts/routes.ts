import { Router } from 'express'
const router: Router = Router()

import { hasDeviceId, isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'
import { validateInsertShift, validateUpdateShift } from './middlewares'

router.route('/')
	.post(hasDeviceId, validateInsertShift, controller.create)
	.put(hasDeviceId, validateUpdateShift, controller.update)
	.get(isLoggedIn, tokenIsValid, controller.getAll)

router.get('/sold-details/:shiftId', isLoggedIn, tokenIsValid, controller.getSoldDetails)

export default router
