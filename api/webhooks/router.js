/**
 * Clients Notifications Routes
 */

'use strict'

import ClientsNotifications from './controller'

module.exports = function (app, router) {
  /**
    * Get Notifications
    */
  router.get('/v1/clients/notifications', AUTH, (req, res) => {
    ClientsNotifications({ req, res }).index()
  })
}
