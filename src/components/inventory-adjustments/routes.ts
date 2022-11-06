import { Router } from 'express'

import controller from './controller'
import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
const routes: Router = Router()

routes.post('/', isLoggedIn, tokenIsValid, controller.create)

export default routes
