import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
const routes: Router = Router()

routes.post('/', isLoggedin, tokenIsValid, controller.create)

export default routes
