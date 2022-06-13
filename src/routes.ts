import { Router } from 'express'

const router: Router = Router()

import users from './components/users/routes'
import clients from './components/clients/routes'
import business from './components/business/routes'
import barcodes from './components/barcodes/routes'
import businessTypes from './components/business-types/routes'
import categories from './components/categories/routes'
import brands from './components/brands/routes'
import salesPaymentTypes from './components/sales-payments-types/routes'
import coupons from './components/coupons/routes'
import roles from './components/roles/routes'
import products from './components/products/routes'
import devices from './components/devices/routes'
import auth from './components/auth/routes'
import provinces from './components/provinces/routes'
import providers from './components/providers/routes'
import banks from './components/banks/routes'
import sales from './components/sales/routes'
import shifts from './components/shifts/routes'
import inventoryAdjustments from './components/inventory-adjustments/routes'

router.use('/auth', auth)
router.use('/users', users)
router.use('/clients', clients)
router.use('/business', business)
router.use('/business-types', businessTypes)
router.use('/categories', categories)
router.use('/brands', brands)
router.use('/barcodes', barcodes)
router.use('/sales-payment-types', salesPaymentTypes)
router.use('/coupons', coupons)
router.use('/roles', roles)
router.use('/banks', banks)
router.use('/products', products)
router.use('/devices', devices)
router.use('/providers', providers)
router.use('/provinces', provinces)
router.use('/sales', sales)
router.use('/shifts', shifts)
router.use('/inventory-adjustments', inventoryAdjustments)

router.all('*', (req, res) => res.sendStatus(404))

export default router
