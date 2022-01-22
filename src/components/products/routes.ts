import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'

routes
	.route('/')
	.get(controller.getAll)
	.post(controller.create)
	.put(controller.update)

routes.route('/:id').get(controller.getOne).delete(controller.delete)

export default routes
