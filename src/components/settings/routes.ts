import { Router } from 'express'

const routes: Router = Router()
import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes.route('/').get(isLoggedIn, tokenIsValid, controller.get).put(isLoggedIn, tokenIsValid, controller.update)

routes.get('/updates', controller.getUpdates)

export default routes
