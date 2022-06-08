import { Router } from 'express'

import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import { uploadSingle } from '../../middlewares/files'
import controller from './controller'
const router: Router = Router()

router
	.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, controller.create)
	.put(isLoggedin, tokenIsValid, controller.update)

router.post(
	'/set-logo-image',
	isLoggedin,
	tokenIsValid,
	uploadSingle('images/business-logo/'),
	controller.setLogoImage
)

router.get('/confirm', controller.confirm)
router.get('/by-merchant-id', controller.getByMerchantId)

router.route('/:id').get(isLoggedin, tokenIsValid, controller.getOne)

export default router
