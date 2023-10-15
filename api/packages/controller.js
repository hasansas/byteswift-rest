/**
 * Packages Controller
 */

'use strict'

import SequalizePagintaion from '../../libs/sequalize_pagintaion'
import roleMiddleware from '../../middleware/role'

class PackagesController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.packagesModel = DB.packages
  }

  /**
   * Display a listing of packages.
   *
   * @return {Object} HTTP Response
   */
  async index () {
    try {
      // Params
      const order = this.query.order ?? 'position'
      const sort = this.query.sort ?? 'ASC'

      // trial package
      if (this.query.isTrial && this.query.isTrial === 'true') {
        const trialPackage = await this.packagesModel.findOne({
          where: {
            isTrial: true
          }
        })
        return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok, data: trialPackage })
      }

      // filter
      const Op = DB.Sequelize.Op

      let filter = { isTrial: false }
      let attributes = {}
      if (this.query.search) {
        filter = {
          ...{ name: { [Op.iLike]: `%${this.query.search}%` } }
        }
      }

      // client scope
      const userAuth = this.request.userAuth
      if (userAuth === null || userAuth.role === 'client') {
        filter = {
          ...{
            isTrial: false,
            publish: true
          }
        }
        attributes = {
          ...{ attributes: { exclude: ['publish'] } }
        }
      }

      // Get data
      const sequalizePagintaion = SequalizePagintaion(this.request)
      return this.packagesModel
        .findAndCountAll({
          offset: sequalizePagintaion.offset(),
          limit: sequalizePagintaion.limit,
          order: [
            [order, sort]
          ],
          where: {
            ...{
              deletedAt: null,
              ...filter
            }
          },
          ...attributes
        })
        .then((data) => {
          const _data = {
            total: data.count,
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
   * Display the specified contact.
   *
   * @param {uuid} id
   * @return {Object} HTTP Response
   */
  async show () {
    try {
      // filter
      let filter = [{ id: this.request.params.id }]

      if (this.query.slug) {
        const name = this.request.params.id.replaceAll('-', ' ')
        filter = [DB.Sequelize.where(
          DB.Sequelize.fn('lower', DB.Sequelize.col('name')),
          DB.Sequelize.fn('lower', name))
        ]
      }

      // client scope
      const userAuth = this.request.userAuth
      let attributes = {}
      if (userAuth === null || userAuth.role === 'client') {
        attributes = {
          ...{ attributes: { exclude: ['publish'] } }
        }
      }

      return this.packagesModel
        .findOne({
          where: [
            ...filter,
            ...[{ deleted_at: null }]
          ],
          ...attributes
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
   * Create new package
   *
   * @param {number} id
   * @param {string} name
   * @param {string} description
   * @param {string} content
   * @param {number} price
   * @param {number} quota
   * @param {number} duration
   * @param {boolean} publish
   * @param {number} position
   * @return {Object} HTTP Response
   */
  async create () {
    try {
      // Role authorization
      roleMiddleware({ req: this.request, res: this.res, allowedRoles: ['superadmin', 'admin'] })

      // validate request
      const errors = EXPRESS_VALIDATOR.validationResult(this.request)
      if (!errors.isEmpty()) {
        const _error = {
          errors: errors.array()
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // Data item
      const _item = {
        name: this.request.body.name,
        description: this.request.body.description,
        content: this.request.body.content,
        price: this.request.body.price,
        quota: this.request.body.quota,
        duration: this.request.body.duration,
        publish: this.request.body.publish,
        position: this.request.body.position,
        createdBy: this.request.authUser.id
      }

      // add data
      return this.packagesModel
        .create(_item)
        .then((data) => {
          const _data = { id: data.id }
          return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.created, data: _data })
        })
        .catch((error) => {
          return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
        })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Update the specified package.
   *
   * @param {number} id
   * @param {string} name
   * @param {string} description
   * @param {string} content
   * @param {number} price
   * @param {number} quota
   * @param {number} duration
   * @param {boolean} publish
   * @param {number} position
   * @return {Object} HTTP Response
   */
  async update () {
    try {
      // Role authorization
      roleMiddleware({ req: this.request, res: this.res, allowedRoles: ['superadmin', 'admin'] })

      // get template
      const id = this.request.params.id
      const getTemplate = await this.packagesModel.findOne({
        where: { id: id }
      })

      if (getTemplate === null) {
        const _error = {
          errors: 'Template not exist'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // update template
      const template = getTemplate.dataValues
      const item = Object.keys(template)
        .reduce((a, key) => (
          { ...a, [key]: this.request.body[key] || template[key] }
        ), {})
      item.publish = this.request.body.publish || false

      await this.packagesModel.update(item, {
        where: { id: id }
      })

      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Remove the specified package.
   *
   * @param {uuid} id
   * @return {Object} HTTP Response
   */
  async delete () {
    try {
      // Role authorization
      roleMiddleware({ req: this.request, res: this.res, allowedRoles: ['superadmin', 'admin'] })

      // update deleted by
      const _id = this.request.params.id
      await this.packagesModel.update(
        { deletedBy: this.request.authUser.id },
        { where: { id: _id } }
      )

      // delete item
      await this.packagesModel.destroy({
        where: { id: _id }
        // force: true
      })

      // success response
      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: error })
    }
  }
}
export default ({ req, res }) => new PackagesController({ req, res })
