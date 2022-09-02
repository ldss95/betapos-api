import { Router } from 'express'

const routes: Router = Router()
import controller from './controller'
import { isLoggedin } from '../../middlewares/auth'
import { uploadSingle } from '../../middlewares/files'

routes.route('/').get(isLoggedin, controller.getAll)

routes.post('/pay', isLoggedin, uploadSingle('payments/'), controller.markAsPayed)

export default routes
