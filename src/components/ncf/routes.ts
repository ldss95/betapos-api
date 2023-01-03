import { Router } from 'express'
import multer from 'multer'

const routes: Router = Router()
const getFields = multer()

import { hasMerchantId, isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes.post('/upload', isLoggedIn, tokenIsValid, getFields.single('file'), controller.uploadNcfFile)
routes.post('/', isLoggedIn, tokenIsValid, controller.getAll)
routes.get('/states', isLoggedIn, tokenIsValid, controller.getStates)
routes.get('/types', isLoggedIn, tokenIsValid, controller.getTypes)
routes.get('/availability', isLoggedIn, tokenIsValid, controller.getAvailability)
routes.post('/availability', isLoggedIn, tokenIsValid, controller.updateAvailability)
routes.get('/business-by-rnc/:rnc', controller.getByRnc)
routes.post('/next-ncf-number', hasMerchantId, controller.getNextNcf)

export default routes
