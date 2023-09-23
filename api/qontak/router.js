/**
 * Qontak Routes
 */

'use strict'

import QontakController from './controller'

module.exports = function (app, router) {
  /**
   * Create contact list
   */
  router.post('/v1/qontak/contacts',
    EXPRESS_VALIDATOR.body('name').not().isEmpty(),
    EXPRESS_VALIDATOR.body('file').not().isEmpty(),
    (req, res) => {
      QontakController({ req, res }).createContacts()
    })
}
