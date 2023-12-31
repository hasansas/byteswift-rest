/**
 * Qontak Routes
 */

'use strict'

import QontakController from './controller'

module.exports = function (app, router) {
  /**
   * Create broadcast recipient
   */
  router.post('/v1/qontak/broadcast/recipient',
    EXPRESS_VALIDATOR.body('name').not().isEmpty(),
    EXPRESS_VALIDATOR.body('contacts').not().isEmpty(),
    AUTH,
    (req, res) => {
      QontakController({ req, res }).createContacts()
    })

  /**
     * Create broadcast
     */
  router.post('/v1/qontak/broadcast',
    EXPRESS_VALIDATOR.body('name').not().isEmpty(),
    EXPRESS_VALIDATOR.body('message_template_id').not().isEmpty(),
    EXPRESS_VALIDATOR.body('contact_list_id').not().isEmpty(),
    AUTH,
    (req, res) => {
      QontakController({ req, res }).createBroadcast()
    })

  /**
   * Send broadcast direct
   */
  router.post('/v1/qontak/broadcast/direct',
    EXPRESS_VALIDATOR.body('name').not().isEmpty(),
    EXPRESS_VALIDATOR.body('phoneNumber').not().isEmpty(),
    EXPRESS_VALIDATOR.body('templateId').not().isEmpty(),
    AUTH,
    (req, res) => {
      QontakController({ req, res }).sendMessage()
    })

  /**
   * get whatsapp templates
   */
  router.get('/v1/qontak/templates', AUTH, (req, res) => {
    QontakController({ req, res }).indexTemplates()
  })
}
