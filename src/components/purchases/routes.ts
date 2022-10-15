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

router.route('/file/:id')
	.put(isLoggedin, tokenIsValid, uploadSingle('purchases/', 'file'), validateAtachFile, controller.attachFile)
	.delete(isLoggedin, tokenIsValid, controller.removeAttachedFile)

router.put('/pay/:id', isLoggedin, tokenIsValid, controller.markAsPayed)

export default router
