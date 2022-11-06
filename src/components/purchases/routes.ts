import { Router } from 'express'

import controller from './controller'
import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import { validateAttachFile, validateNewPurchase, validateUpdatePurchase, validateUpdateProductQty, validateUpdateProductCost, validateUpdateProductPrice } from './middlewares'
import { uploadSingle } from '../../middlewares/files'
const router: Router = Router()

router.route('/')
	.get(isLoggedIn, tokenIsValid, controller.getAll)
	.post(isLoggedIn, tokenIsValid, validateNewPurchase, controller.create)
	.put(isLoggedIn, tokenIsValid, validateUpdatePurchase, controller.update)

router.route('/:id')
	.get(isLoggedIn, tokenIsValid, controller.getOne)
	.delete(isLoggedIn, tokenIsValid, controller.delete)

router.route('/file/:id')
	.put(isLoggedIn, tokenIsValid, uploadSingle('purchases/', 'file'), validateAttachFile, controller.attachFile)
	.delete(isLoggedIn, tokenIsValid, controller.removeAttachedFile)

router.put('/pay/:id', isLoggedIn, tokenIsValid, controller.markAsPayed)
router.put('/update-product-qty/', isLoggedIn, tokenIsValid, validateUpdateProductQty, controller.updateProductQty)
router.put('/update-product-cost/', isLoggedIn, tokenIsValid, validateUpdateProductCost, controller.updateProductCost)
router.put('/update-product-price/', isLoggedIn, tokenIsValid, validateUpdateProductPrice, controller.updateProductPrice)
router.post('/add-product', isLoggedIn, tokenIsValid, controller.addProduct)

router.delete('/remove-product/:id', isLoggedIn, tokenIsValid, controller.removeProduct)

export default router
