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
    this.qontakPrefix = 'Byteswift - '
    this.qontakSuffix = ' ' + moment().unix()
    this.qontakToken = ENV.QONTAK_TOKEN
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
  createBroadcastDirect ({ toName, toNumber, templateId, language = 'en', variables = [] }) {
    try {
      //  body
      const body = {
        to_name: toName,
        to_number: toNumber,
        message_template_id: templateId,
        channel_integration_id: ENV.QONTAK_WHATSAPP_CANNEL_ID,
        language: {
          code: language
        },
        parameters: {
          body: variables
        }
      }

      // header
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + this.qontakToken

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
   * Create Broadcast
   *
   * @param {string} name
   * @param {string} templateId
   * @param {string} contactListId
   * @param {Array} parameters
   * @return {Object} Response
   */
  createBroadcast ({ name, templateId, contactListId, variables = [] }) {
    try {
      //  body
      const broadcastName = this.qontakPrefix + name + this.qontakSuffix
      const body = {
        name: broadcastName,
        message_template_id: templateId,
        contact_list_id: contactListId,
        channel_integration_id: ENV.QONTAK_WHATSAPP_CANNEL_ID,
        parameters: {
          body: variables
        }
      }

      // header
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + this.qontakToken

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
}

export default () => new Qontak()
