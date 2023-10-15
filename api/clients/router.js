/**
 * Clients Routes
 */

'use strict'

import ClientsController from './controller'

module.exports = function (app, router) {
  /**
    * Get Clients
    */
  router.get('/v1/clients', AUTH, (req, res) => {
    ClientsController({ req, res }).index()
  })

  /**
    * Get my client
    */
  router.get('/v1/clients/me', AUTH, (req, res) => {
    ClientsController({ req, res }).showMe()
  })

  /**
    * Get specific client
    */
  router.get('/v1/clients/:id', AUTH, (req, res) => {
    ClientsController({ req, res }).show()
  })

  /**
    * Add new client
    */
  router.post('/v1/clients', AUTH, (req, res) => {
    ClientsController({ req, res }).store()
  })

  /**
    * Update the specific client
    */
  router.patch('/v1/clients/:id', AUTH, (req, res) => {
    ClientsController({ req, res }).update()
  })

  /**
    * Remove client.
    */
  router.delete('/v1/clients/:id', AUTH, (req, res) => {
    ClientsController({ req, res }).delete()
  })
}
