/**
 * Users Routes
 */

'use strict'

import UsersController from './controller'

module.exports = function (app, router) {
  /**
   * Register User
   */
  router.post(
    '/v1/users/register',
    EXPRESS_VALIDATOR.body('email').isEmail().normalizeEmail(),
    EXPRESS_VALIDATOR.body('name').not().isEmpty(),
    EXPRESS_VALIDATOR.check('password')
      .isLength({ min: 8 }).withMessage('must be at least 8 chars long')
      .matches(/\d/).withMessage('must contain a number'),
    (req, res) => {
      UsersController({ req, res }).register()
    }
  )

  /**
   * Confirm Register
   */
  router.post(
    '/v1/users/register/confirm',
    EXPRESS_VALIDATOR.body('email').isEmail().normalizeEmail(),
    EXPRESS_VALIDATOR.body('code').not().isEmpty(),
    (req, res) => {
      UsersController({ req, res }).confirmRegister()
    }
  )

  /**
   * Login
   */
  router.post(
    '/v1/auth/login/:role',
    EXPRESS_VALIDATOR.body('email').isEmail(),
    EXPRESS_VALIDATOR.body('password').not().isEmpty(),
    (req, res) => {
      UsersController({ req, res }).login()
    }
  )

  /**
   * Auth Google
   */
  router.post(
    '/v1/auth/google',
    EXPRESS_VALIDATOR.body('code').not().isEmpty(),
    EXPRESS_VALIDATOR.body('redirect_uri').not().isEmpty(),
    (req, res) => {
      UsersController({ req, res }).authGoogle()
    }
  )

  /**
   * Logout
   */
  router.post('/v1/auth/logout', AUTH, (req, res) => {
    UsersController({ req, res }).logout()
  })

  /**
   * Logout All
   */
  router.post('/v1/auth/logout/all', AUTH, (req, res) => {
    UsersController({ req, res }).logoutAllDevices()
  })

  /**
   * Get Users
   */
  router.get('/v1/users', AUTH, (req, res) => {
    UsersController({ req, res }).index()
  })
}
