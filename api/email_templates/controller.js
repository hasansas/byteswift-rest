/**
 * Email Templates Controller
 */

'use strict'

import SequalizePagintaion from '../../libs/sequalize_pagintaion'
import roleMiddleware from '../../middleware/role'

class EmailTemplateController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.emailTemplatesModel = DB.emailTemplates
  }

  /**
   * Display a listing of the groups.
   *
   * @return {Object} HTTP Response
   */
  async index () {
    try {
      // Role authorization
      roleMiddleware({ req: this.request, res: this.res, allowedRoles: ['superadmin', 'admin'] })

      // Params
      const order = this.query.order ?? 'name'
      const sort = this.query.sort ?? 'ASC'

      // filter
      let filter = {}
      const Op = DB.Sequelize.Op
      if (this.query.search) {
        filter = {
          ...{ name: { [Op.iLike]: `%${this.query.search}%` } }
        }
      }

      // Get data
      const sequalizePagintaion = SequalizePagintaion(this.request)
      return this.emailTemplatesModel
        .findAndCountAll({
          offset: sequalizePagintaion.offset(),
          limit: sequalizePagintaion.limit,
          order: [
            [order, sort]
          ],
          where: {
            ...{
              ...filter
            }
          }
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
   * Update the specified template.
   *
   * @param {number} id
   * @param {string} name
   * @param {string} description
   * @param {json} contentCode
   * @param {string} contentHtml
   * @param {string} contentText
   * @param {number} position
   * @return {Object} HTTP Response
   */
  async update () {
    try {
      // Role authorization
      roleMiddleware({ req: this.request, res: this.res, allowedRoles: ['superadmin', 'admin'] })

      // get template
      const id = this.request.params.id
      const getTemplate = await this.emailTemplatesModel.findOne({
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

      await this.emailTemplatesModel.update(item, {
        where: { id: id }
      })

      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }
}
export default ({ req, res }) => new EmailTemplateController({ req, res })
