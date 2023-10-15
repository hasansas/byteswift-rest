/**
 * Send Response
 */

'use strict'

import httpResponse from './http_response.js'

export const sendSuccessResponse = function ({ res, statusCode, data, message = 'Successful' }) {
  if (res.headersSent !== true) {
    if (statusCode === 501) {
      return res.status(statusCode).send(httpResponse.message({ statusCode }).title)
    }
    return res.status(statusCode).send({
      status: 'success',
      message,
      data
    })
  }
}

export const sendErrorResponse = function ({ res, req, statusCode, error = {} }) {
  if (res.headersSent !== true) {
    const _httpResponseMessage = httpResponse.message({ req, statusCode })
    let _errorMessage = error.message ?? _httpResponseMessage.description
    const _error = error.errors ?? null

    if (error.name) {
      switch (error.name) {
        case 'SequelizeConnectionRefusedError':
          _errorMessage = 'Error establishing a database connection'
          break

        case 'SequelizeValidationError':
          break

        default:
          break
      }
    }

    let _payload = {
      status: 'error',
      message: _errorMessage
    }

    if (_error != null) {
      _payload = { ..._payload, ...{ error: _error } }
    }

    return res.status(statusCode).send(_payload)
  }
}

const sendResponse = {
  success: sendSuccessResponse,
  error: sendErrorResponse
}

export default sendResponse
