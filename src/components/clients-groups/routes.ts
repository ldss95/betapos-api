import { Router } from 'express'
const routes: Router = Router()

import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes.get('/', isLoggedIn, tokenIsValid, controller.getAll)
routes.get('/debt/:groupId', isLoggedIn, tokenIsValid, controller.getDebtByGroup)

export default routes
