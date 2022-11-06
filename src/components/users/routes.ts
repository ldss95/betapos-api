import { Router } from 'express'
const router: Router = Router()

import { hasMerchantId, isBusinessAdmin, isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import { uploadSingle } from '../../middlewares/files'
import controller from './controller'

router.get('/updates/:date', hasMerchantId, controller.getUpdates)

router
	.route('/')
	.get(isLoggedIn, tokenIsValid, controller.getAll)
	.post(isLoggedIn, tokenIsValid, controller.create)
	.put(isLoggedIn, tokenIsValid, controller.update)

router.get('/list', isLoggedIn, tokenIsValid, controller.getList)

router
	.route('/:id')
	.get(isLoggedIn, tokenIsValid, controller.getOne)
	.delete(isLoggedIn, tokenIsValid, isBusinessAdmin, controller.delete)

router.post(
	'/set-profile-image',
	isLoggedIn,
	tokenIsValid,
	uploadSingle('images/profile/'),
	controller.setProfileImage
)

router.post('/photo', isLoggedIn, tokenIsValid, uploadSingle('images/users/'), controller.addPhoto)

export default router
