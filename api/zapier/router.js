/**
 * Qontak Routes
 */

'use strict'

import ZapierController from './controller'

module.exports = function (app, router) {
  /**
   * Zoho new lead created
   */
  router.post('/v1/notify/zapier/qontak/zoho/newlead',
    (req, res) => {
      ZapierController({ req, res }).zohoNewLead()
    })
}
