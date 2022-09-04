import { Router } from 'express'
const router: Router = Router()

import controller from './controller'

router.get('/updates/:date', controller.getUpdates)

export default router
