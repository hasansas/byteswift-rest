/**
 * Zapier Controller
 */

'use strict'

import Qontak from './../../libs/apps/qontak.js'

class ZapierController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.clientsModel = DB.clients
    this.clientsConfigurationsModel = DB.clientsConfigurations
  }

  /**
   * Zoho new lead created
   *
   * @return {Object} HTTP Response
   */
  async zohoNewLead () {
    try {
      // authenticate request
      const _authorization = this.request.headers.authorization
      if (!_authorization) {
        const _error = 'No authorization token was found'
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.forbidden, error: { message: _error } })
      }

      // get auth type
      const _authType = _authorization.split(' ')[0]
      const _authKey = _authorization.split(' ')[1]

      if (_authType.toLowerCase() === 'bearer') {
        const _error = 'Invalid authorization token'
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.forbidden, error: { message: _error } })
      }

      // Basic auth using server key & client key
      const _authorizationKey = Buffer.from(_authKey, 'base64')
      const _keys = _authorizationKey.toString('ascii').split(':')

      const clientKey = _keys[0]
      const serverKey = _keys[1]

      const getClient = await this.clientsModel
        .findOne({
          where: {
            serverKey: serverKey,
            clientKey: clientKey
          },
          attributes: ['id', 'userId']
        })

      if (getClient === null) {
        const _error = 'Invalid authorization token'
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.forbidden, error: { message: _error } })
      }

      // set user/client id
      const userId = getClient.userId
      const clientId = getClient.id

      // validate user
      if (typeof userId === 'undefined') {
        const _error = 'Invalid authorization token'
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.forbidden, error: { message: _error } })
      }

      // set request user
      this.request.user = { id: userId, clientId: clientId }

      // get contact
      const contact = {
        name: this.request.body?.Full_Name || '',
        phoneNumber: this.request.body?.Mobile || this.request.body?.Phone || ''
      }

      // get template
      let templateId
      const programRecomended = this.request.body.Program_Recommended
      if (programRecomended) {
        // get configuration
        const getClientConfiguration = await this.clientsConfigurationsModel
          .findAll({
            where: {
              clientId: clientId
            },
            attributes: ['name', 'value']
          })

        // convert configuration array to object
        const clientConfig = getClientConfiguration.reduce((current, next) => {
          const item = {}
          item[next.name] = next.value
          return { ...current, ...item }
        }, {})

        const programRecomendedOptions = {
          premium_internship_program: 'qontak_zoho_lead_created_program_recomended_option1_template_id',
          career_coaching_program: 'qontak_zoho_lead_created_program_recomended_option2_template_id',
          premium_internship_or_career_coaching_program: 'qontak_zoho_lead_created_program_recomended_option3_template_id'
        }

        const programOption = programRecomended.trim().replaceAll(' ', '_').toLowerCase()
        const selectedProgram = programRecomendedOptions[programOption]

        templateId = clientConfig[selectedProgram] || ''
      }

      if (!templateId) {
        const _error = 'Template not provided'
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.forbidden, error: { message: _error } })
      }

      // send message
      const sendMessage = await Qontak().createBroadcastDirect({
        clientId: this.request.user.clientId,
        toName: contact.name,
        toNumber: contact.phoneNumber,
        templateId: templateId,
        variables: [
          {
            key: '1',
            value_text: contact.name,
            value: contact.name.replaceAll(' ', '_').toLowerCase()
          }
        ]
      })

      if (!sendMessage.success) {
        const _error = sendMessage.error
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: { message: _error } })
      }

      return SEND_RESPONSE.success({
        res: this.res,
        statusCode: HTTP_RESPONSE.status.ok,
        data: sendMessage
      })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }
}
export default ({ req, res }) => new ZapierController({ req, res })
