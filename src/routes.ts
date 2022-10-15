import { Router } from 'express'
import { join } from 'path'

const router: Router = Router()

import users from './components/users/routes'
import clients from './components/clients/routes'
import clientsPayments from './components/clients-payments/routes'
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
import cashFlow from './components/cash-flow/routes'
import profits from './components/profits/routes'
import billing from './components/billing/routes'
import settings from './components/settings/routes'
import ncf from './components/ncf/routes'
import purchases from './components/purchases/routes'
import computingScales from './components/computing-scales/routes'

router.use('/auth', auth)
router.use('/users', users)
router.use('/clients', clients)
router.use('/clients-payments', clientsPayments)
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
router.use('/cash-flow', cashFlow)
router.use('/profits', profits)
router.use('/billing', billing)
router.use('/settings', settings)
router.use('/ncf', ncf)
router.use('/purchases', purchases)
router.use('/computing-scales', computingScales)

router.all('*', (req, res) => res.status(404).sendFile(join(__dirname, '404.html')))

export default router
