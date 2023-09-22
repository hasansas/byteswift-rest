/**
 * Role Middleware
 */

'use strict'

export default function ({ req, res, allowedRoles }) {
  if (!allowedRoles.includes(req.authUser.role)) {
    return SEND_RESPONSE.error({ res, req, statusCode: HTTP_RESPONSE.status.forbidden })
  }
};
