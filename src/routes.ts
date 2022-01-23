import { Router } from 'express'

const router: Router = Router()

import users from './components/users/routes'
import business from './components/business/routes'
import categories from './components/categories/routes'
import brands from './components/brands/routes'
import paymentTypes from './components/payment-types/routes'
import coupons from './components/coupons/routes'
import roles from './components/roles/routes'
import products from './components/products/routes'
import auth from './components/auth/routes'

router.use('/auth', auth)
router.use('/users', users)
router.use('/business', business)
router.use('/categories', categories)
router.use('/brands', brands)
router.use('/payment-types', paymentTypes)
router.use('/coupons', coupons)
router.use('/roles', roles)
router.use('/products', products)

router.all('*', (req, res) => res.sendStatus(404))

export default router
