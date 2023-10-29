/**
* Clients Configurations Controller
*/

'use strict'

import roleMiddleware from '../../middleware/role'
import SequalizePagintaion from '../../libs/sequalize_pagintaion'

class ClientsNotifications {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.clientsModel = DB.clients
    this.clientsNotificationsModel = DB.clientsNotifications

    // availble client config
    this.availableConfigurations = ['notification_url']
  }

  /**
    * Display a listing of the resource.
    *
    * @return {Object} HTTP Response
    */
  async index () {
    try {
      // Role authorization
      roleMiddleware({ req: this.request, res: this.res, allowedRoles: ['client'] })

      // build query
      const sequalizePagintaion = SequalizePagintaion(this.request)
      let query = {
        offset: sequalizePagintaion.offset(),
        limit: sequalizePagintaion.limit,
        include: [{
          model: this.clientsModel,
          attributes: [],
          where: { userId: this.request.authUser.id }
        }],
        order: [
          ['createdAt', 'DESC']
        ],
        attributes: ['id', 'message_id', 'request', 'notificationUrl', 'status', 'createdAt']
      }

      // filter by status
      if (this.query.status) {
        query = { ...query, ...{ where: { status: this.query.status } } }
      }

      // get client configurations
      return this.clientsNotificationsModel
        .findAndCountAll(query)
        .then((data) => {
          const _data = {
            total: data.count,
            rows: data.rows
          }
          const resData = sequalizePagintaion.paginate(_data)

          return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok, data: resData })
        })
        .catch((error) => {
          return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: error })
        })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: error })
    }
  }
}
export default ({ req, res }) => new ClientsNotifications({ req, res })
