import { Router } from 'express'
const router: Router = Router()

import usersRoutes from './users'
import businessRoutes from './buseiness'

router.use('/users', usersRoutes)
router.use('/business', businessRoutes)

export default router