import { Router } from 'express'

const routes: Router = Router()
import controller from './controller'
import { isLoggedIn, isAdmin } from '../../middlewares/auth'
import { uploadSingle } from '../../middlewares/files'

routes.route('/').get(isLoggedIn, controller.getAll)

routes.post('/pay', isLoggedIn, isAdmin, uploadSingle('payments/'), controller.markAsPayed)
routes.post('/payed', controller.payedWithStripe)

export default routes
