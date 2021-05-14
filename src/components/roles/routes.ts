import { Router } from 'express'
import controller from './controller'

const router: Router = Router()

router.route('/')
    .get(controller.getAll)
    .post(controller.create)
    .put(controller.update)

router.route('/:id')
    .get(controller.getOne)
    .delete(controller.delete)

export default router