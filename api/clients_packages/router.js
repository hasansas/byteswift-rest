/**
 * Clients Packages Routes
 */

'use strict'

import ClientsPackagesController from './controller'

module.exports = function (app, router) {
  /**
    * Get Clients Packages
    */
  router.get('/v1/client_packages', AUTH, (req, res) => {
    ClientsPackagesController({ req, res }).index()
  })

  /**
    * Check token availability
    */
  router.get('/v1/client_packages/active', AUTH, (req, res) => {
    ClientsPackagesController({ req, res }).activePackages()
  })
}
