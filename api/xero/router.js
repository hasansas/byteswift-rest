/**
 * Xero Routes
 */

'use strict'

import XeroController from './controller'

module.exports = function (app, router) {
  /**
   * Get token
   */
  router.post('/v1/xero/token',
    EXPRESS_VALIDATOR.body('grant_type').not().isEmpty(),
    (req, res) => {
      XeroController({ req, res }).getToken()
    })

  /**
   * Get connections
   */
  router.get('/v1/xero/connections', (req, res) => {
    XeroController({ req, res }).getConnections()
  })

  /**
   * Get invoices
   */
  router.get('/v1/xero/invoices', (req, res) => {
    XeroController({ req, res }).getInvoices()
  })

  /**
   * Get contact
   */
  router.get('/v1/xero/contacts/:xeroContactId', (req, res) => {
    XeroController({ req, res }).getContact()
  })
}
