/**
 * Email Template Routes
 */

'use strict'

import EmailTemplateController from './controller'

module.exports = function (app, router) {
  // Get email templates
  router.get(
    '/v1/email/templates',
    AUTH,
    (req, res) => { EmailTemplateController({ req, res }).index() }
  )

  // update email templates
  router.patch(
    '/v1/email/templates/:id',
    AUTH,
    (req, res) => { EmailTemplateController({ req, res }).update() }
  )
}
