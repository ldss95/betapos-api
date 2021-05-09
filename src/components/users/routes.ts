import { Router } from 'express'
const router: Router = Router()

import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

router.route('/:id')
    .get(isLoggedin, tokenIsValid, controller.getOne)
    .delete(isLoggedin, tokenIsValid, controller.delete)

router.route('/')
    .get(isLoggedin, tokenIsValid, controller.getAll)
    .post(isLoggedin, tokenIsValid, controller.create)
    .put(isLoggedin, tokenIsValid, controller.update)

export default router