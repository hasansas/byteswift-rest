/**
 * Messages Routes
 */

'use strict'

import MessagesController from './controller'

module.exports = function (app, router) {
  // Get Messages
  router.get('/v1/messages', (req, res) => {
    MessagesController({ req, res }).index()
  })

  // Get specific Contact
  router.get('/v1/messages/:id', (req, res) => {
    MessagesController({ req, res }).show()
  })
}
