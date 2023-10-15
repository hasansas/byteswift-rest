/**
 * Packages Routes
 */

'use strict'

import PackagesController from './controller'

module.exports = function (app, router) {
  // Get Packages
  router.get('/v1/packages', (req, res) => {
    PackagesController({ req, res }).index()
  })

  // Get specific Package
  router.get('/v1/packages/:id', (req, res) => {
    PackagesController({ req, res }).show()
  })

  // Add new Package
  router.post('/v1/packages',
    EXPRESS_VALIDATOR.body('name').not().isEmpty(),
    EXPRESS_VALIDATOR.body('price').not().isEmpty(),
    EXPRESS_VALIDATOR.body('quota').not().isEmpty(),
    EXPRESS_VALIDATOR.body('duration').not().isEmpty(),
    AUTH,
    (req, res) => {
      PackagesController({ req, res }).create()
    })

  // Update the specific Package
  router.patch('/v1/packages/:id', AUTH, (req, res) => {
    PackagesController({ req, res }).update()
  })

  // Remove Package
  router.delete('/v1/packages/:id', AUTH, (req, res) => {
    PackagesController({ req, res }).delete()
  })
}
