import { Router } from 'express'
const routes: Router = Router()

import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes.route('/').post(isLoggedin, tokenIsValid, controller.create)

export default routes
