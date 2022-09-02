import { Router } from 'express'
import multer from 'multer'

const routes: Router = Router()
const getFields = multer()

import { isLoggedin, tokenIsValid } from '../../middlewares/auth'
import controller from './controller'

routes.post('/upload', isLoggedin, tokenIsValid, getFields.single('file'), controller.uploadNcfFile)
routes.get('/', isLoggedin, tokenIsValid, controller.getAll)

export default routes
