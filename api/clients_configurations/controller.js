/**
* Clients Configurations Controller
*/

'use strict'

import roleMiddleware from '../../middleware/role'
import SequalizePagintaion from '../../libs/sequalize_pagintaion'

const { v4: uuidv4 } = require('uuid')

class ClientsConfigurationsController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.clientsModel = DB.clients
    this.clientsConfigurationsModel = DB.clientsConfigurations

    // availble client config
    this.availableConfigurations = [
      'qontak_token',
      'qontak_whatsapp_channel_id',
      'qontak_xero_invoice_template_id',
      'qontak_zoho_lead_created_template_id'
    ]

    // hide configurations
    this.hiddenConfigurations = [
      'qontak_token',
      'qontak_whatsapp_channel_id'
    ]

    // Role authorization
    roleMiddleware({ req: this.request, res: this.res, allowedRoles: ['client'] })
  }

  /**
    * Display a listing of the resource.
    *
    * @return {Object} HTTP Response
    */
  async index () {
    try {
      // get client configurations
      const sequalizePagintaion = SequalizePagintaion(this.request)
      return this.clientsConfigurationsModel
        .findAndCountAll({
          offset: sequalizePagintaion.offset(),
          limit: sequalizePagintaion.limit,
          order: [
            ['name', 'ASC']
          ],
          attributes: ['name', 'value'],
          include: [{
            model: this.clientsModel,
            attributes: [],
            where: { userId: this.request.authUser.id }
          }]
        })
        .then((data) => {
          if (data.count === 0) {
            data.count = this.availableConfigurations.length
            this.availableConfigurations.forEach(element => {
              const _item = {
                name: element,
                value: ''
              }
              data.rows.push(_item)
            })
          }

          const configurationData = data.rows.map(e => {
            if (this.hiddenConfigurations.includes(e.name)) {
              e.value = this.hideString(e.value)
            }
            return e
          })
          const _data = {
            total: data.count,
            rows: configurationData
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

  /**
   * Update the specified resource in storage.
   *
   * @return {Object} HTTP Response
   */
  async update () {
    try {
      // get client
      const _client = await this.clientsModel
        .findOne({
          where: {
            userId: this.request.authUser.id
          },
          attributes: ['id']
        })

      // get current configurations
      const _currentConfiguration = await this.clientsConfigurationsModel
        .findAll({
          where: {
            clientId: _client.id
          },
          attributes: ['name', 'value']
        })

      const _attributes = []
      this.availableConfigurations.forEach(element => {
        const _currentConfig = _currentConfiguration.find(e => e.name === element)
        const _currentValue = _currentConfig ? _currentConfig.value : ''
        const _row = {
          id: uuidv4(),
          clientId: _client.id,
          name: element,
          value: this.request.body[element] && this.request.body[element] !== '' ? this.request.body[element] : _currentValue,
          created_at: new Date(),
          updated_at: new Date()
        }
        _attributes.push(_row)
      })

      // delete current configurations
      await this.clientsConfigurationsModel.destroy({
        where: {
          clientId: _client.id
        }
      })

      // set new configurations
      await this.clientsConfigurationsModel.bulkCreate(_attributes)

      // success response
      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.created })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: error })
    }
  }

  /**
   * Hide string (rplaced with x)
   *
   * @return {String} hidden string
   */
  hideString (str) {
    let hiddenStr = str

    if (str.length > 7) {
      const prefixStrLength = 2
      const suffixStrLength = str.length - 5
      const prefixStr = str.substring(0, prefixStrLength)
      const suffixStr = str.substring(suffixStrLength)
      const trimmedStr = str.substring(2, suffixStrLength)
      const encodedStr = trimmedStr.replace(/[0-9 a-z A-Z]/g, 'x')

      hiddenStr = prefixStr + encodedStr + suffixStr
    }
    return hiddenStr
  }
}
export default ({ req, res }) => new ClientsConfigurationsController({ req, res })
