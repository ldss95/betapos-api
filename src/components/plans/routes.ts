import { Router } from 'express'

import controller from './controller'
const router: Router = Router()

router.get('/', controller.getAll)

export default router
