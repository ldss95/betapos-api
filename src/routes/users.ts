import { Router } from 'express'
import controller from '../controllers/users'
const router: Router = Router()

router.route('/:id')
    .get(controller.getOne)
    .put(controller.update)
    .delete(controller.delete)

router.route('/')
    .get(controller.getAll)
    .post(controller.create)

export default router