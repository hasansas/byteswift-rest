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
  }

  /**
   * Zoho new lead created
   *
   * @return {Object} HTTP Response
   */
  async zohoNewLead () {
    try {
      // get contact
      const contact = {
        name: this.request.body?.Full_Name || '',
        phoneNumber: this.request.body?.Mobile || this.request.body?.Phone || ''
      }

      // send message
      const templateId = 'a588881b-b81e-4dd6-91c2-64370cacca66'
      const sendMessage = await Qontak().createBroadcastDirect({
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
