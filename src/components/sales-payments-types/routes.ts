import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'

routes.route('/').get(controller.getAll)

routes.route('/:id').get(isLoggedIn, tokenIsValid, controller.getOne)

export default routes
