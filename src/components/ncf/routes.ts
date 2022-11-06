import { Router } from 'express'
import multer from 'multer'

const routes: Router = Router()
const getFields = multer()

import { isLoggedIn, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes.post('/upload', isLoggedIn, tokenIsValid, getFields.single('file'), controller.uploadNcfFile)
routes.post('/', isLoggedIn, tokenIsValid, controller.getAll)
routes.get('/states', isLoggedIn, tokenIsValid, controller.getStates)

export default routes
