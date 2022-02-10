import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'

routes.get('/', controller.getAll)

export default routes
