import { Router } from 'express'

const routes: Router = Router()
import controller from './controller'
import { isLoggedin } from '../../middlewares/auth'

routes.route('/').get(isLoggedin, controller.getAll)

export default routes
