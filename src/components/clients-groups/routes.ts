import { Router } from 'express'
const routes: Router = Router()

import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes.route('/')
	.get(isLoggedIn, tokenIsValid, controller.getAll)
	.post(isLoggedIn, tokenIsValid, controller.create)

routes.get('/debt/:groupId', isLoggedIn, tokenIsValid, controller.getDebtByGroup)
routes.get('/detailed-report', isLoggedIn, controller.getDetailedReport)
routes.post('/apply-payment', isLoggedIn, tokenIsValid, controller.applyClientsGroupPayments)

export default routes
