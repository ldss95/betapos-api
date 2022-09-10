import { Router } from 'express'
import { hasMerchantId } from '../../middlewares/auth'
const router: Router = Router()

import controller from './controller'

router.get('/updates/:date', hasMerchantId, controller.getUpdates)

export default router
