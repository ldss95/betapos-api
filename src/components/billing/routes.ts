import { Router } from 'express'

const routes: Router = Router()
import controller from './controller'
import { isLoggedin, isAdmin } from '../../middlewares/auth'
import { uploadSingle } from '../../middlewares/files'

routes.route('/').get(isLoggedin, controller.getAll)

routes.post('/pay', isLoggedin, isAdmin, uploadSingle('payments/'), controller.markAsPayed)

export default routes
