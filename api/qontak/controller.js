/**
 * Qontak Controller
 */

'use strict'

import axios from 'axios'
// import { Parser } from '@json2csv/plainjs'
// import { Readable } from 'stream'
// import { Transform } from '@json2csv/node'

import { stringify } from 'csv-stringify'

const fs = require('fs')
const FormData = require('form-data')
const path = require('path')

class QontakController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.qontakToken = ENV.QONTAK_TOKEN
  }

  /**
   * Create Contacts List
   *
   * @param {string} name
   * @param {File} file
   * @return {Object} HTTP Response
   */
  createContacts () {
    try {
      const vm = this

      // validate request
      const errors = EXPRESS_VALIDATOR.validationResult(this.request)
      if (!errors.isEmpty()) {
        const _error = {
          errors: errors.array()
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      //  body
      const name = this.request.body.name
      const contacts = this.request.body.contacts

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
      form.append('name', name)
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
          return SEND_RESPONSE.success({
            res: vm.res,
            statusCode: HTTP_RESPONSE.status.ok,
            data: response.data
          })
        })
        .catch(function (error) {
          const _error = error.response.data
          return SEND_RESPONSE.error({ res: vm.res, statusCode: HTTP_RESPONSE.status.badRequest, error: { message: _error } })
        })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Create Broadcast
   *
   * @param {string} name
   * @param {Object} parameters
   * @return {Object} HTTP Response
   */
  createBroadcast () {
    try {
      const vm = this

      // validate request
      const errors = EXPRESS_VALIDATOR.validationResult(this.request)
      if (!errors.isEmpty()) {
        const _error = {
          errors: errors.array()
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      //  body
      const name = this.request.body.name
      const messageTemplateId = this.request.body.message_template_id
      const contactListId = this.request.body.contact_list_id

      const body = {
        name: name,
        message_template_id: messageTemplateId,
        contact_list_id: contactListId,
        channel_integration_id: ENV.QONTAK_WHATSAPP_CANNEL_ID,
        parameters: {
          body: this.request.body.parameters.body || []
        }
      }

      // header
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + this.qontakToken

      // api url
      const _url = 'https://service-chat.qontak.com/api/open/v1/broadcasts/whatsapp'

      return axios.post(_url, body)
        .then(async function (response) {
          return SEND_RESPONSE.success({
            res: vm.res,
            statusCode: HTTP_RESPONSE.status.ok,
            data: response.data
          })
        })
        .catch(function (error) {
          const _error = error.response.data
          return SEND_RESPONSE.error({ res: vm.res, statusCode: HTTP_RESPONSE.status.badRequest, error: { message: _error } })
        })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }
}
export default ({ req, res }) => new QontakController({ req, res })
