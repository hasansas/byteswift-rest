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

      // send message
      const templateId = 'a588881b-b81e-4dd6-91c2-64370cacca66'
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
