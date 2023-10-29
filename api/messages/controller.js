/**
 * Messages Controller
 */

'use strict'

import { verify } from 'jsonwebtoken'
import SequalizePagintaion from '../../libs/sequalize_pagintaion'
import moment from 'moment'

class MessagesController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.clientsModel = DB.clients
    this.MessagesModel = DB.messages
  }

  /**
   * Display a listing of Messagess.
   *
   * @return {Object} HTTP Response
   */
  async index () {
    try {
      // user auth
      const auth = await this.auth()
      if (!auth.success) {
        return SEND_RESPONSE.error({ res: this.res, statusCode: auth.status, error: { message: auth.error } })
      }

      // Params
      const order = this.query.order ?? 'createdAt'
      const sort = this.query.sort ?? 'DESC'

      // filter
      const Op = DB.Sequelize.Op
      let filter = {}

      if (this.query.search) {
        filter = {
          ...{
            [Op.or]: [
              { chatGroupId: { [Op.iLike]: `%${this.query.search}%` } },
              { refId: { [Op.iLike]: `%${this.query.search}%` } }
            ]
          }
        }
      }

      if (this.query.created) {
        filter = {
          createdAt: {
            [Op.gt]: moment(this.query.created, 'YYYY-MM-DD').toDate(),
            [Op.lt]: moment(this.query.created, 'YYYY-MM-DD').add(1, 'days').toDate()
          }
        }
      }

      // Get data
      const sequalizePagintaion = SequalizePagintaion(this.request)

      const getBroadcastMessages = await DB.sequelize.transaction(async (t) => {
        // get messages
        const _getMessages = await this.MessagesModel
          .findAndCountAll({
            offset: sequalizePagintaion.offset(),
            limit: sequalizePagintaion.limit,
            order: [
              [order, sort]
            ],
            where: {
              ...{
                createdBy: this.request.authUser.id,
                deletedAt: null,
                ...filter
              }
            }
          }, { transaction: t })

        // get queuing messages
        const _queuingMessages = await this.MessagesModel.findAndCountAll({
          where: {
            ...{
              status: 'queuing',
              createdBy: this.request.authUser.id,
              deletedAt: null,
              ...filter
            }
          },
          attributes: ['id']
        }, { transaction: t })

        // get waiting messages
        const _waitingMessages = await this.MessagesModel.findAndCountAll({
          where: {
            ...{
              status: 'waiting',
              createdBy: this.request.authUser.id,
              deletedAt: null,
              ...filter
            }
          },
          attributes: ['id']
        }, { transaction: t })

        // get success messages
        const _successMessages = await this.MessagesModel.findAndCountAll({
          where: {
            ...{
              status: 'success',
              createdBy: this.request.authUser.id,
              deletedAt: null,
              ...filter
            }
          },
          attributes: ['id']
        }, { transaction: t })

        // get failed messages
        const _failedMessages = await this.MessagesModel.findAndCountAll({
          where: {
            ...{
              status: 'failed',
              tries: { [Op.eq]: 3 },
              createdBy: this.request.authUser.id,
              deletedAt: null,
              ...filter
            }
          },
          attributes: ['id']
        }, { transaction: t })

        const _data = {
          total: _getMessages.count,
          rows: _getMessages.rows
        }
        const resData = {
          ...sequalizePagintaion.paginate(_data),
          ...{
            status: {
              queuing: _queuingMessages.count,
              waiting: _waitingMessages.count,
              success: _successMessages.count,
              failed: _failedMessages.count
            }
          }
        }

        return { success: true, data: resData }
      })
        .catch((error) => {
          return { success: false, error }
        })

      if (!getBroadcastMessages.success) {
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: getBroadcastMessages.error })
      }

      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok, data: getBroadcastMessages.data })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Display the specified message.
   *
   * @param {uuid} id
   * @return {Object} HTTP Response
   */
  async show () {
    try {
      // user auth
      const auth = await this.auth()
      if (!auth.success) {
        return SEND_RESPONSE.error({ res: this.res, statusCode: auth.status, error: { message: auth.error } })
      }

      // get message
      return this.MessagesModel
        .findOne({
          where: {
            id: this.request.params.id,
            createdBy: this.request.authUser.id,
            deleted_at: null
          }
        })
        .then((data) => {
          return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok, data })
        })
        .catch((error) => {
          return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
        })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * user auth
   *
   * @return {Object} auth
   */
  async auth () {
    try {
      // authenticate request
      const _authorization = this.request.headers.authorization
      if (!_authorization) {
        return {
          success: false,
          error: 'No authorization token was found',
          status: HTTP_RESPONSE.status.forbidden
        }
      }

      // get auth type
      let userId, clientId
      const autType = {
        basic: 'Basic',
        bearer: 'Bearer'
      }
      const _authType = _authorization.split(' ')[0]
      const _authKey = _authorization.split(' ')[1]

      // auth using server key & client key
      if (_authType === autType.basic) {
        const _authorizationKey = Buffer.from(_authKey, 'base64')
        const _keys = _authorizationKey.toString('ascii').split(':')

        const serverKey = _keys[0]
        const clientKey = _keys[1]

        const getClient = await this.clientsModel
          .findOne({
            where: {
              serverKey: serverKey,
              clientKey: clientKey
            },
            attributes: ['id', 'userId']
          })

        if (getClient === null) {
          return {
            success: false,
            error: 'Invalid authorization token',
            status: HTTP_RESPONSE.status.unauthorized
          }
        }
        userId = getClient.userId
        clientId = getClient.id
      }

      // auth using bearer token
      if (_authType === autType.bearer) {
        const _jwtSecret = ENV.JWT_SECRET
        verify(_authKey, _jwtSecret, (err, authUser) => {
          if (err) {
            return {
              success: false,
              error: 'Invalid authorization token',
              status: HTTP_RESPONSE.status.unauthorized
            }
          }

          userId = authUser.id
        })

        // get client
        const getClient = await this.clientsModel
          .findOne({
            where: { userId: userId },
            attributes: ['id']
          })

        if (getClient === null) {
          return {
            success: false,
            error: 'Client not found',
            status: HTTP_RESPONSE.status.unauthorized
          }
        }
        clientId = getClient.id
      }

      // validate user
      if (typeof userId === 'undefined') {
        return {
          success: false,
          error: 'Invalid authorization token',
          status: HTTP_RESPONSE.status.unauthorized
        }
      }

      // set user
      this.request.authUser = { id: userId, clientId: clientId }

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error,
        status: HTTP_RESPONSE.status.internalServerError
      }
    }
  }
}
export default ({ req, res }) => new MessagesController({ req, res })
