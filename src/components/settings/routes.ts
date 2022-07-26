import { Router } from 'express'

const routes: Router = Router()
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes.route('/').get(isLoggedin, tokenIsValid, controller.get).put(isLoggedin, tokenIsValid, controller.update)

routes.get('/updates', controller.getUpdates)

export default routes
