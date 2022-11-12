import { Router } from 'express'

import controller from './controller'
import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import { inventoryAdjustmentInterceptor } from './middlewares'
const routes: Router = Router()

routes.post('/', isLoggedIn, tokenIsValid, inventoryAdjustmentInterceptor, controller.create)

export default routes
