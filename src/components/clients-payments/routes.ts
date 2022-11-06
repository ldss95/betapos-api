import { Router } from 'express'
const routes: Router = Router()

import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes.route('/').post(isLoggedIn, tokenIsValid, controller.create)

export default routes
