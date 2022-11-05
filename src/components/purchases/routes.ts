import { Router } from 'express'

import controller from './controller'
import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import { validateAtachFile, validateNewPurchase, validateUpdatePurchase, validateUpdateProductQty } from './middlewares'
import { uploadSingle } from '../../middlewares/files'
const router: Router = Router()

router.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, validateNewPurchase, controller.create)
	.put(isLoggedin, tokenIsValid, validateUpdatePurchase, controller.update)

router.route('/:id')
	.get(isLoggedin, tokenIsValid, controller.getOne)
	.delete(isLoggedin, tokenIsValid, controller.delete)

router.route('/file/:id')
	.put(isLoggedin, tokenIsValid, uploadSingle('purchases/', 'file'), validateAtachFile, controller.attachFile)
	.delete(isLoggedin, tokenIsValid, controller.removeAttachedFile)

router.put('/pay/:id', isLoggedin, tokenIsValid, controller.markAsPayed)
router.put('/update-product-qty/', isLoggedin, tokenIsValid, validateUpdateProductQty, controller.updateProductQty)
router.post('/add-product', isLoggedin, tokenIsValid, controller.addProduct)

router.delete('/remove-product/:id', isLoggedin, tokenIsValid, controller.removeProduct)

export default router
