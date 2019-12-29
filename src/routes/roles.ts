import { Router } from 'express'
import controller from '../controllers/roles'

const router: Router = Router()

router.route('/')
    .get(controller.getAll)
    .post(controller.create)

router.route('/:id')
    .get(controller.getOne)
    .put(controller.update)
    .delete(controller.delete)

export default router