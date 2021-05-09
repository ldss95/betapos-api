import { Router } from 'express'
import controller from './controller'
const router: Router = Router()

router.route('/')
    .get(controller.getAll)
    .post(controller.create)

router.route('/:id')
    .get(controller.getOne)
    .put(controller.update)

export default router