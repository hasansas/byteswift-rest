/**
 * Xero Controller
 */

'use strict'

import axios from 'axios'

class XeroController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
  }

  /**
   * Get Responses
   *
   * @return {Object} HTTP Response
   */
  getResponses () {
    try {
      const vm = this

      // typeform client
      const tfClient = this.request.headers['typeform-client']
      if (!tfClient) {
        const _error = {
          errors: 'typeform-client required'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }
      const clientTokens = {
        sb: 'tfp_DgCa1znA73HaH4gib8VzSCaUPfdW1N9Pbe6VrKsjscjg_3stYCK8cAGdT1U'
      }

      // typeform token
      if (!clientTokens[tfClient]) {
        const _error = {
          errors: 'invalid typeform client'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }
      const token = clientTokens[tfClient]

      // header
      axios.defaults.headers.common['Content-Type'] = 'application/json'
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + token

      // params
      const limit = this.query.limit || 10
      const formId = this.query.form_id

      // api url
      const _url = `https://api.typeform.com/forms/${formId}/responses?page_size=${limit}`

      return axios.get(_url)
        .then(async function (response) {
          return SEND_RESPONSE.success({
            res: vm.res,
            statusCode: HTTP_RESPONSE.status.ok,
            data: response.data
          })
        })
        .catch(function (error) {
          const _error = error
          return SEND_RESPONSE.error({ res: vm.res, statusCode: HTTP_RESPONSE.status.badRequest, error: { message: _error } })
        })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }
}
export default ({ req, res }) => new XeroController({ req, res })
