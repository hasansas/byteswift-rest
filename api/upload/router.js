/**
 * Upload Routes
 */

'use strict'

import UploadController from './controller'

module.exports = function (app, router) {
  router.post('/v1/upload', AUTH, (req, res) => {
    UploadController({ req, res }).store()
  })
}
