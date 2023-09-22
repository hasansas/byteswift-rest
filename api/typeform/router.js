/**
 * Xero Routes
 */

'use strict'

import XeroController from './controller'

module.exports = function (app, router) {
  /**
   * Get responses
   */
  router.get('/v1/typeform/responses',
    (req, res) => {
      XeroController({ req, res }).getResponses()
    })
}
