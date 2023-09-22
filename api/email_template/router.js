/**
 * Email Templates Routes
 */

'use strict'

import EmailTemplatesController from './controller'

module.exports = function (app, router) {
  // Get packages
  router.get('/v1/email_templates', AUTH, (req, res) => {
    EmailTemplatesController({ req, res }).index()
  })

  // Get specific packages
  router.get('/v1/email_templates/:id', AUTH, (req, res) => {
    EmailTemplatesController({ req, res }).show()
  })

  // Add new package.
  router.post(
    '/v1/email_templates',
    AUTH,
    EXPRESS_VALIDATOR.body('name').not().isEmpty(),
    (req, res) => {
      EmailTemplatesController({ req, res }).store()
    })

  // Update the specific package.
  router.patch(
    '/v1/email_templates/:id',
    AUTH,
    EXPRESS_VALIDATOR.body('name').not().isEmpty(),
    (req, res) => {
      EmailTemplatesController({ req, res }).update()
    })
}
