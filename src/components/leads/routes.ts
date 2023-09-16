import { Router } from 'express'
const router: Router = Router()

import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'
import { canGetLeads, validateNewLead } from './middlewares'

router.get('/', isLoggedIn, tokenIsValid, canGetLeads, controller.getAll)
router.post('/', isLoggedIn, tokenIsValid, validateNewLead, controller.create)
router.get('/mine', isLoggedIn, tokenIsValid, canGetLeads, controller.getAllUserLeads)

export default router
