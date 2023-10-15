/**
* Clients Packages Controller
*/

'use strict'

import SequalizePagintaion from '../../libs/sequalize_pagintaion'

class ClientsPackagesController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req ? req.query : null
    this.res = res
    this.clientsPackagesModel = DB.clientsPackages
    this.clientsModel = DB.clients
    this.tokenUsesModel = DB.tokenUses
  }

  /**
    * Display a listing of the resource.
    *
    * @return {Object} HTTP Response
    */
  async index () {
    try {
      // Params
      const order = this.query.order ?? 'createdAt'
      const sort = this.query.sort ?? 'DESC'

      // filter
      const Op = DB.Sequelize.Op

      let filter = {}
      if (this.query.search) {
        filter = {
          ...{ packageName: { [Op.iLike]: `%${this.query.search}%` } }
        }
      }

      // Get data
      const sequalizePagintaion = SequalizePagintaion(this.request)
      return this.clientsPackagesModel
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
        })
        .then((data) => {
          const _data = {
            total: data.count.length,
            rows: data.rows
          }
          const resData = sequalizePagintaion.paginate(_data)

          return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok, data: resData })
        })
        .catch((error) => {
          return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
        })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
    * Get token availability
    *
    * @return {Object} HTTP Response
    */
  async activePackages () {
    try {
      return this.clientsModel
        .findOne({
          attributes: ['id'],
          where: { userId: this.request.authUser.id }
        })
        .then(async (data) => {
          const clientId = data.id

          const getToken = await this.getActivePackages({ clientId })

          if (!getToken.success) {
            return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: getToken.error })
          }
          return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok, data: getToken.data })
        })
        .catch((error) => {
          return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
        })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
    * Get token
    *
    * @param {uuid} userId
    * @return {Integer} Response
    */
  async getActivePackages ({ clientId }) {
    try {
      const Op = DB.Sequelize.Op

      const result = await DB.sequelize.transaction(async (t) => {
        // get active packages
        const activePackages = await this.clientsPackagesModel
          .findAll({
            attributes: ['id', 'packageName', ['package_quota', 'packageToken'], ['quota', 'token'], 'duration', 'createdAt', 'expiredAt'],
            order: [
              ['createdAt', 'asc']
            ],
            where: {
              expiredAt: { [Op.gte]: new Date() },
              clientId: clientId,
              deletedAt: null
            }
          }, { transaction: t })

        // get package token
        const packageToken = await this.clientsPackagesModel
          .sum('packageQuota', {
            where: {
              expiredAt: { [Op.gte]: new Date() },
              clientId: clientId,
              deletedAt: null
            }
          }, { transaction: t })

        // get token
        const token = await this.clientsPackagesModel
          .sum('quota', {
            where: {
              expiredAt: { [Op.gte]: new Date() },
              clientId: clientId,
              deletedAt: null
            }
          }, { transaction: t })

        return {
          success: true,
          data: {
            packages: activePackages,
            packageToken: packageToken ?? 0,
            token: token ?? 0
          }
        }
      })

      return result
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }

  /**
    * Use token
    *
    * @param {uuid} clientPackageId
    * @param {uuid} messageId
    * @param {String} reff
    * @return {Integer} Response
    */
  async useToken ({ clientId, messageId, event = 'chat' }) {
    try {
      const Op = DB.Sequelize.Op
      const result = await DB.sequelize.transaction(async (t) => {
        // get user
        const user = await this.clientsModel
          .findOne({
            attributes: ['userId'],
            where: { id: clientId }
          })
        const userId = user.userId

        // get active packages
        const activePackages = await this.clientsPackagesModel
          .findAll({
            attributes: ['id', 'quota'],
            order: [
              ['createdAt', 'asc']
            ],
            where: {
              quota: { [Op.gt]: 0 },
              expiredAt: { [Op.gte]: new Date() },
              clientId: clientId,
              deletedAt: null
            }
          }, { transaction: t })

        if (activePackages.length > 0) {
          const _package = activePackages[0]

          // update package quota/token
          const newToken = Number(_package.quota) - 1
          await this.clientsPackagesModel
            .update(
              { quota: newToken },
              {
                where: { id: _package.id }
              }, { transaction: t })

          // add to token uses
          await this.tokenUsesModel
            .create({
              clientPackageId: _package.id,
              messageId: messageId,
              event: event,
              createdBy: userId
            }, { transaction: t })
        }

        return { success: true }
      })

      return result
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }
}
export default ({ req, res }) => new ClientsPackagesController({ req, res })
