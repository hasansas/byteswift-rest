/**
 * Clients Routes
 */

'use strict'

import ClientsConfigurationsController from './controller'

module.exports = function (app, router) {
  /**
    * Get Configurations
    */
  router.get('/v1/clients/config', AUTH, (req, res) => {
    ClientsConfigurationsController({ req, res }).index()
  })

  /**
    * Set Configurations
    */
  router.put('/v1/clients/config', AUTH, (req, res) => {
    ClientsConfigurationsController({ req, res }).update()
  })
}
