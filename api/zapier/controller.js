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
    this.webhooksModel = DB.webhooks
    this.messagesModel = DB.messages
    this.event = 'zoho_new_lead_created'
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

      // save to webhook
      const eventData = {
        userId: userId,
        event: this.event,
        request: this.request.body
      }
      this.webhooksModel.create(eventData)

      // get contact
      const programRecomended = this.request.body.Program_Recommended
      const contact = {
        name: this.request.body?.Full_Name || '',
        phoneNumber: this.request.body?.Mobile || this.request.body?.Phone || ''
      }

      if ((!programRecomended || programRecomended === '') || contact.name === '' || contact.phoneNumber === '') {
        return SEND_RESPONSE.success({
          res: this.res,
          statusCode: HTTP_RESPONSE.status.ok,
          message: 'No action'
        })
      }

      // get template
      let templateId
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

      // messages
      const messages = {
        userId: userId,
        templateId: templateId,
        event: this.event,
        status: 'error',
        error: ''
      }

      if (!templateId) {
        const _error = 'Template not provided'
        messages.error = _error
        this.messagesModel.create(messages)
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.forbidden, error: { message: _error } })
      }

      // get template
      const getTemplate = await Qontak().getTemplate({ clientId, templateId })

      if (!getTemplate.success) {
        const _error = getTemplate.error
        const getError = Array.isArray(getTemplate.error.error.messages)
          ? getTemplate.error.error.messages[0] || 'Unknown error'
          : getTemplate.error.error.messages
        const errReason = typeof getError === 'string' || getError instanceof String ? getError : 'Unknown error'
        messages.error = errReason
        this.messagesModel.create(messages)

        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: { message: _error } })
      }

      let header = null
      if (getTemplate.data.header) {
        const _header = {
          format: 'IMAGE',
          example: '#<Hashie::Mash header_handle=#<Hashie::Array ["https://scontent.whatsapp.net/v/t61.29466-34/381031121_1104813207149564_2333868501296039660_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=74IiHr4JxVEAX_e9JD2&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&oh=01_AdQIdfYtr2MbSQLgKUYomm8DWM-nEurHmgbPbHkRX7mB0Q&oe=656C0F84"]>>'
        }
        // const _header = getTemplate.data.header
        const format = _header.format
        // const example = _header.example

        if (format === 'IMAGE') {
          // const getStringBetween = function (startStr, endStr, str) {
          //   const pos = str.indexOf(startStr) + startStr.length
          //   return str.substring(pos, str.indexOf(endStr, pos))
          // }
          // const start = '["'
          // const end = '"]'
          // const fileUrl = getStringBetween(start, end, example)

          header = {
            format: format,
            params: [
              {
                key: 'url',
                value: 'https://assets.qontak.com/uploads/direct/images/c52871da-a559-4106-ad14-4bd05ca04a06/career_succes_AUD.jpeg'
              }, {
                key: 'banner',
                value: 'banner.png'
              }
            ]
          }
        }
      }

      const messageData = {
        clientId: this.request.user.clientId,
        toName: contact.name,
        toNumber: contact.phoneNumber,
        templateId: templateId,
        header: header,
        variables: [
          {
            key: '1',
            value_text: contact.name,
            value: contact.name.replaceAll(' ', '_').toLowerCase()
          }
        ]
      }

      // send message
      const sendMessage = await Qontak().createBroadcastDirect(messageData)

      if (!sendMessage.success) {
        const _error = sendMessage.error
        const getError = Array.isArray(sendMessage.error.error.messages)
          ? sendMessage.error.error.messages[0] || 'Unknown error'
          : sendMessage.error.error.messages
        const errReason = typeof getError === 'string' || getError instanceof String ? getError : 'Unknown error'
        messages.error = errReason
        this.messagesModel.create(messages)

        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: { message: _error } })
      }

      messages.status = 'success'
      this.messagesModel.create(messages)

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
