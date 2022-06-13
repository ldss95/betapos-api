import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'

routes.route('/').get(controller.getAll)

routes.route('/:id').get(isLoggedin, tokenIsValid, controller.getOne)

export default routes
