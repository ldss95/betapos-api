import { Router } from 'express'
const routes: Router = Router()

import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes.get('/', isLoggedin, tokenIsValid, controller.getAll)

export default routes
