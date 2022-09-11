import { Router } from 'express'

import { isLoggedin, tokenIsValid, isBusinessAdmin } from '../../middlewares/auth'
import { uploadSingle } from '../../middlewares/files'
import controller from './controller'
import { validateGetAllBusiness, validateConfirm } from './middlewares'
const router: Router = Router()

router
	.route('/')
	.get(isLoggedin, tokenIsValid, validateGetAllBusiness, controller.getAll)
	.put(isLoggedin, tokenIsValid, isBusinessAdmin, controller.update)

router.post(
	'/set-logo-image',
	isLoggedin,
	tokenIsValid,
	isBusinessAdmin,
	uploadSingle('images/business-logo/'),
	controller.setLogoImage
)

router.get('/confirm', validateConfirm, controller.confirm)
router.get('/by-merchant-id', controller.getByMerchantId)

router.route('/:id').get(isLoggedin, tokenIsValid, isBusinessAdmin, controller.getOne)

export default router
