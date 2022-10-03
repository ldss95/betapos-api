import { Router } from 'express'
const router: Router = Router()

import { hasMerchantId, isBusinessAdmin, isLoggedin, tokenIsValid } from '../../middlewares/auth'
import { uploadSingle } from '../../middlewares/files'
import controller from './controller'

router.get('/updates/:date', hasMerchantId, controller.getUpdates)

router
	.route('/')
	.get(isLoggedin, tokenIsValid, controller.getAll)
	.post(isLoggedin, tokenIsValid, controller.create)
	.put(isLoggedin, tokenIsValid, controller.update)

router.get('/list', isLoggedin, tokenIsValid, controller.getList)

router
	.route('/:id')
	.get(isLoggedin, tokenIsValid, controller.getOne)
	.delete(isLoggedin, tokenIsValid, isBusinessAdmin, controller.delete)

router.post(
	'/set-profile-image',
	isLoggedin,
	tokenIsValid,
	uploadSingle('images/profile/'),
	controller.setProfileImage
)

router.post('/photo', isLoggedin, tokenIsValid, uploadSingle('images/users/'), controller.addPhoto)

export default router
