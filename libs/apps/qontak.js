/**
 * Qontak
 */

import axios from 'axios'
import moment from 'moment'
import { stringify } from 'csv-stringify'

const fs = require('fs')
const FormData = require('form-data')
const path = require('path')

class Qontak {
  constructor () {
    this.clientsConfigurationsModel = DB.clientsConfigurations
    this.qontakPrefix = 'Byteswift - '
    this.qontakSuffix = ' ' + moment().unix()
  }

  /**
   * Get Qontak Settings
   *
   * @param {string} clientId
   * @return {Object} Response
   */
  async qontakSettings ({ clientId }) {
    // get configuration
    const getClientConfiguration = await this.clientsConfigurationsModel
      .findAll({
        where: {
          clientId: clientId
        },
        attributes: ['name', 'value']
      })

    // convert configuration array to object
    const clientConfig = getClientConfiguration.reduce((current, next) => {
      const item = {}
      item[next.name] = next.value
      return { ...current, ...item }
    }, {})

    const qontakToken = clientConfig?.qontak_token || ''
    const qontakWhatsappChannelId = clientConfig?.qontak_whatsapp_channel_id || ''
    const qontakZohoLeadCreatedTemplateId = clientConfig?.qontak_zoho_lead_created_template_id || ''

    if (qontakToken === '') {
      const _error = 'Qontak token not set'
      return {
        success: false,
        error: _error
      }
    }

    if (qontakWhatsappChannelId === '') {
      const _error = 'Whatsapp channel ID not set'
      return {
        success: false,
        error: _error
      }
    }

    return {
      success: true,
      data: {
        qontakToken,
        qontakWhatsappChannelId,
        qontakZohoLeadCreatedTemplateId
      }
    }
  }

  /**
   * Create Contacts List
   *
   * @param {string} name
   * @param {Array} contacts
   * @return {Object} Response
   */
  createContacts ({ name, contacts }) {
    try {
      // tmp path
      const tmpPath = path.join(ROOT_DIR, '/.tmp')
      if (!fs.existsSync(tmpPath)) {
        fs.mkdirSync(tmpPath)
      }

      // create csv
      const csvName = 'tmp-contacts.csv'
      const csvFilePath = tmpPath + '/' + csvName
      const writableStream = fs.createWriteStream(csvFilePath)

      const columns = [
        'phone_number',
        'full_name',
        'customer_name',
        'company'
      ]
      const stringifier = stringify({ header: true, columns: columns })

      // add contact
      const contactGroup = this.qontakPrefix + name + this.qontakSuffix
      for (let index = 0; index < contacts.length; index++) {
        const _contact = contacts[index]
        stringifier.write(
          [
            _contact.phone_number,
            _contact.full_name,
            _contact.customer_name,
            _contact.company
          ]
        )
      }
      stringifier.pipe(writableStream)

      // Form
      const form = new FormData()
      form.append('name', contactGroup)
      form.append('source_type', 'spreadsheet')
      form.append('file', fs.createReadStream(csvFilePath))

      // header
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + this.qontakToken

      // api url
      const _url = 'https://service-chat.qontak.com/api/open/v1/contacts/contact_lists/async'

      return axios.post(_url, form)
        .then(async function (response) {
          fs.rm(csvFilePath, { recursive: true, force: true }, (_) => {
            // console.log(err)
          })
          return {
            success: true,
            data: response.data?.data
          }
        })
        .catch(function (error) {
          const _error = error.response.data
          return {
            success: false,
            error: _error
          }
        })
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }

  /**
   * Create Broadcast Direct
   *
   * @param {string} name
   * @param {string} templateId
   * @param {string} contactListId
   * @param {Array} parameters
   * @return {Object} Response
   */
  async createBroadcastDirect ({ clientId, toName, toNumber, templateId, language = 'en', header = null, variables = [] }) {
    try {
      // get qontak settings
      const getQontakSettings = await this.qontakSettings({ clientId, event: 'zoho_new_lead_created' })
      if (!getQontakSettings.success) {
        return {
          success: false,
          error: getQontakSettings.error
        }
      }

      //  body
      const qontakToken = getQontakSettings.data?.qontakToken
      const qontakWhatsappChannelId = getQontakSettings.data?.qontakWhatsappChannelId

      const body = {
        to_name: toName,
        to_number: toNumber,
        message_template_id: templateId,
        channel_integration_id: qontakWhatsappChannelId,
        language: {
          code: language
        },
        parameters: {
          body: variables
        }
      }

      if (header) {
        body.parameters.header = header
      }

      // header
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + qontakToken

      // api url
      const _url = 'https://service-chat.qontak.com/api/open/v1/broadcasts/whatsapp/direct'
      return axios.post(_url, body)
        .then(async function (response) {
          return {
            success: true,
            data: response.data?.data
          }
        })
        .catch(function (error) {
          const _error = error?.response?.data ||
            error?.message ||
            'Something went wrong. Please check your qontak token, whatsapp channel id and template id configuration.'
          return {
            success: false,
            error: _error
          }
        })
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }

  /**
   * Create Broadcast
   *
   * @param {string} name
   * @param {string} templateId
   * @param {string} contactListId
   * @param {Array} parameters
   * @return {Object} Response
   */
  async createBroadcast ({ clientId, name, templateId, contactListId, variables = [] }) {
    try {
      // get qontak settings
      const getQontakSettings = await this.qontakSettings({ clientId })
      if (!getQontakSettings.success) {
        return {
          success: false,
          error: getQontakSettings.error
        }
      }

      //  body
      const broadcastName = this.qontakPrefix + name + this.qontakSuffix
      const qontakToken = getQontakSettings.data?.qontakToken
      const qontakWhatsappChannelId = getQontakSettings.data?.qontakWhatsappChannelId

      const body = {
        name: broadcastName,
        message_template_id: templateId,
        contact_list_id: contactListId,
        channel_integration_id: qontakWhatsappChannelId,
        parameters: {
          body: variables
        }
      }

      // header
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + qontakToken

      // api url
      const _url = 'https://service-chat.qontak.com/api/open/v1/broadcasts/whatsapp'
      return axios.post(_url, body)
        .then(async function (response) {
          return {
            success: true,
            data: response.data?.data
          }
        })
        .catch(function (error) {
          const _error = error.response.data
          return {
            success: false,
            error: _error
          }
        })
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }

  async getTemplate ({ clientId, templateId }) {
    try {
      // get qontak settings
      const getQontakSettings = await this.qontakSettings({ clientId })
      if (!getQontakSettings.success) {
        return {
          success: false,
          error: getQontakSettings.error
        }
      }
      const qontakToken = getQontakSettings.data?.qontakToken

      // header
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + qontakToken

      // api url
      const _url = `https://service-chat.qontak.com/api/open/v1/templates/${templateId}/whatsapp`
      return axios.get(_url)
        .then(async function (response) {
          return {
            success: true,
            data: response.data?.data
          }
        })
        .catch(function (error) {
          const _error = error.response.data
          return {
            success: false,
            error: _error
          }
        })
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }
}

export default () => new Qontak()
