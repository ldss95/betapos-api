import { Router } from 'express'
const router: Router = Router()

import controller from './controller'

router.route('/').post(controller.create).put(controller.update)

router.get('/updates/:date', controller.getUpdates)
router.delete('/:id', controller.delete)

export default router
