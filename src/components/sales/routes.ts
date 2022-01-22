import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'

routes
	.route('/')
	.get(controller.getAll)
	.post(controller.create)
	.put(controller.update)

routes.get('/status-list', controller.statusList)

routes.route('/:id').get(controller.getOne).delete(controller.delete)

export default routes
