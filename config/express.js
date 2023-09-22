/**
 * Express Config
 */

'use strict'

import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import httpResponse from '../helpers/http_response'
import sendResponse from '../helpers/send_response'
import { upload } from './fileUpload'

const expressValidator = require('express-validator')

export default function (app) {
  // Request body parser for url
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  // Request body parser for json
  app.use(bodyParser.json())

  // parsing multipart/form-data
  app.use(upload)

  // Validator
  global.EXPRESS_VALIDATOR = expressValidator

  // Response
  global.HTTP_RESPONSE = httpResponse
  global.SEND_RESPONSE = sendResponse

  // Media storage
  app.get('/media', (req, res) => {
    res.send('401 - Forbiden')
  })

  app.get('/media/*', (req, res) => {
    const reqUrl = req.url.split('/')
    const url = ['/storage', ...reqUrl.slice(2)]
    const filePath = path.join(ROOT_DIR, url.join('/'))
    try {
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath)
      } else {
        res.send('404 - Not found')
      }
    } catch (err) {
      res.send('500 - internal server error')
    }
  })
};
