import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import { validateAtachFile, validateNewPurchase, validateUpdatePurchase } from './middlewares'
import { uploadSingle } from '../../middlewares/files'
const router: Router = Router()

router.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, validateNewPurchase, controller.create)
	.put(isLoggedin, tokenIsValid, validateUpdatePurchase, controller.update)

router.get('/:id', isLoggedin, tokenIsValid, controller.getOne)
router.put('/file/:id', isLoggedin, tokenIsValid, uploadSingle('purchases/', 'file'), validateAtachFile, controller.attachFile)

export default router
