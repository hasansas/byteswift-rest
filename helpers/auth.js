/**
 * User Auth Helper
 */

'use strict'

import JWTR from 'jwt-redis'
import Redis from '../config/redis'

export default async function (req, res, next) {
  try {
    // get authorization header
    const _authHeader = req.headers.authorization
    const _jwtSecret = ENV.JWT_SECRET

    let userAuth = null
    if (_authHeader) {
      const authHeaderType = _authHeader.split(' ')[0]
      if (authHeaderType.toLowerCase() === 'bearer') {
        // redis connect
        const redis = Redis()
        const connect = await redis.connect()
        if (!connect.success) {
          const err = {
            message: `Could not connect to redis. ${connect.error.message}`
          }
          return SEND_RESPONSE.error({ res: res, statusCode: HTTP_RESPONSE.status.internalServerError, error: err })
        }
        const redisClient = connect.client

        // verify jwt token
        const jwtr = new JWTR(redisClient)
        const _token = _authHeader.split(' ')[1]
        const verify = await jwtr.verify(_token, _jwtSecret)

        // set user auth
        userAuth = {
          id: verify.id,
          role: verify.role
        }

        // disconnect redis
        redisClient.disconnect()
      }
    }

    // add request auth user
    req.userAuth = userAuth

    next()
  } catch (error) {
    if (error.name && error.name === 'TokenDestroyedError') {
      return SEND_RESPONSE.error({ res: res, statusCode: HTTP_RESPONSE.status.internalServerError, error: { message: 'Invalid authorization token' } })
    }
    return SEND_RESPONSE.error({ res: res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
  }
};
