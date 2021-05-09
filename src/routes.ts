import { Router } from 'express'
const router: Router = Router()

import users from './components/users/routes'
import business from './components/business/routes'
import branchs from './components/branchs/routes'
import categories from './components/categories/routes'
import paymentTypes from './components/payment-types/routes'
import coupons from './components/coupons/routes'
import auth from './components/auth/routes'

router.use('/auth', auth)
router.use('/users', users)
router.use('/business', business)
router.use('/branchs', branchs)
router.use('/categories', categories)
router.use('/payment-types', paymentTypes)
router.use('/coupons', coupons)

router.all('*', (req, res) => res.sendStatus(404))

export default router