/**
 * Qontak Controller
 */

'use strict'

import axios from 'axios'
// import { Parser } from '@json2csv/plainjs'
import { Readable } from 'stream'
// import { Transform } from '@json2csv/node'

// const fs = require('fs')
const FormData = require('form-data')
// const path = require('path')

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

      // api url
      const _url = 'https://service-chat.qontak.com/api/open/v1/contacts/contact_lists/async'

      // header
      axios.defaults.headers.common.Accept = 'application/json'
      axios.defaults.headers.common.Authorization = 'Bearer ' + this.qontakToken

      // body
      // const tmpPath = path.join(ROOT_DIR, '/.tmp')
      const name = this.request.body.name

      const data = [
        {
          phone_number: '0987654321',
          full_name: 'Baba Yaga',
          customer_name: '',
          company: ''
        }
      ]
      const dataStream = Readable.from(data)

      // const json2csvParser = new Transform()

      console.log(dataStream)
      // const csv = ''
      // dataStream
      //   .pipe(json2csvParser)
      // .on('data', chunk => (csv += chunk.toString()))
      // .on('end', () => console.log(csv))
      // .on('error', err => console.error(err))

      // const json2csvParser = new Parser()
      // const csv = json2csvParser.parse(data)

      // const contacts = this.request.body.contacts

      const form = new FormData()
      form.append('name', name)
      form.append('source_type', 'spreadsheet')
      form.append('file', dataStream)
      // form.append('file', fs.createReadStream(`${tmpPath}/contact.csv`))

      return axios.post(_url, form)
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
