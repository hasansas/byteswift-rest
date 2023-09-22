/**
 * Xero Controller
 */

'use strict'

import axios from 'axios'
const FormData = require('form-data')

class XeroController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.xeroClientId = ENV.XERO_CLIENT_ID
    this.secretClientId = ENV.XERO_SECRET_ID
  }

  /**
   * Get Token
   *
   * @param {string} grant_type // authorization_code, refresh_token
   * @param {string} code
   * @param {string} redirect_uri
   * @param {string} scope
   * @param {string} refresh_token // required for grant_type=refresh_token
   * @return {Object} HTTP Response
   */
  async getToken () {
    try {
      const vm = this

      // validate request
      const errors = EXPRESS_VALIDATOR.validationResult(this.request)
      if (!errors.isEmpty()) {
        const _error = {
          errors: errors.array()
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // create basic key
      const _authKey = this.xeroClientId + ':' + this.secretClientId
      const _authorizationKey = Buffer.from(_authKey, 'ascii')
      const _keys = _authorizationKey.toString('base64')

      // header
      axios.defaults.headers.common.Authorization = 'Basic ' + _keys

      // request body
      const grantType = this.request.body.grant_type
      const redirectUri = this.request.body.redirect_uri
      const code = this.request.body.code
      const refreshToken = this.request.body.refresh_token

      const bodyFormData = new FormData()
      bodyFormData.append('grant_type', grantType)

      // api url
      const apiUrl = 'https://identity.xero.com/connect/token'

      // get token
      if (grantType === 'authorization_code') {
        // body
        bodyFormData.append('code', code)
        bodyFormData.append('redirect_uri', redirectUri)

        return axios.post(apiUrl, bodyFormData)
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
      } else if (grantType === 'refresh_token') {
        if (!refreshToken) {
          const _error = {
            errors: 'refresh_token required'
          }
          return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
        }

        bodyFormData.append('refresh_token', refreshToken)
        return axios.post(apiUrl, bodyFormData)
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
      } else {
        const _error = {
          errors: 'invalid grant_type'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Get Connections
   *
   * @param {string} accessToken
   * @return {Object} HTTP Response
   */
  getConnections () {
    try {
      const vm = this

      // xero token
      const token = this.request.headers['xero-token']
      if (!token) {
        const _error = {
          errors: 'xero-token required'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // header
      axios.defaults.headers.common['Content-Type'] = 'application/json'
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + token

      // api url
      const _url = 'https://api.xero.com/connections'

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

  /**
   * Get Invoices
   *
   * @param {string} accessToken
   * @param {string} xeroTenantId
   * @return {Object} HTTP Response
   */
  getInvoices () {
    try {
      const vm = this

      // xero token
      const token = this.request.headers['xero-token']
      if (!token) {
        const _error = {
          errors: 'xero-token required'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // xero tenant id
      const tenantId = this.request.headers['xero-tenant-id']
      if (!tenantId) {
        const _error = {
          errors: 'xero-tenant-id required'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // header
      axios.defaults.headers.common['Content-Type'] = 'application/json'
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + token
      axios.defaults.headers.common['xero-tenant-id'] = tenantId

      // params
      const duedate = this.query.duedate

      // api url
      const filter = {
        dueDate: `DueDate%3DDateTime(${duedate.replaceAll('-', '%2C')})`
      }
      const _url = `https://api.xero.com/api.xro/2.0/Invoices?where=Status%3D%22AUTHORISED%22%20and%20${filter.dueDate}`

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

  /**
   * Get Contact
   *
   * @param {string} accessToken
   * @param {string} xeroTenantId
   * @param {string} xeroContactId
   * @return {Object} HTTP Response
   */
  getContact () {
    try {
      const vm = this
      const xeroContactId = this.request.params.xeroContactId

      // xero token
      const token = this.request.headers['xero-token']
      if (!token) {
        const _error = {
          errors: 'xero-token required'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // xero tenant id
      const tenantId = this.request.headers['xero-tenant-id']
      if (!tenantId) {
        const _error = {
          errors: 'xero-tenant-id required'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // header
      axios.defaults.headers.common['Content-Type'] = 'application/json'
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + token
      axios.defaults.headers.common['xero-tenant-id'] = tenantId

      // api url
      const _url = 'https://api.xero.com/api.xro/2.0/Contacts/' + xeroContactId

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
