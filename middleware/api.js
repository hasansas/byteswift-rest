/**
 * API Middleware
 */

'use strict'

export default function (req, res, next) {
  const _xApiKeyHeader = req.headers['x-api-key']
  const _xApiKey = ENV.API_SECRET

  if (!_xApiKeyHeader) {
    return res.status(403).json({
      message: 'No API key was found',
      status: 403
    })
  }
  if (_xApiKeyHeader !== _xApiKey) {
    return res.status(401).json({
      message: 'Invalid API key',
      status: 401
    })
  }
  next()
};
