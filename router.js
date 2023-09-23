/**
 * Routes
 */

'use strict'

import { sync } from 'glob'
import express from 'express'
import authenticateAPI from './middleware/api'

const path = require('path')

export default function (app) {
  // Check health
  app.get('/__health', (req, res) => {
    res.status(200).json({ message: 'OK' })
  })

  // x-api-key
  app.use(function (req, res, next) {
    authenticateAPI(req, res, next)
  })

  // load all v1 routes Dynamically
  const _router = express.Router()
  sync(path.join(ROOT_DIR, '/api/**/**/router.js')).forEach(function (name) {
    require(name)(app, _router)
  })

  app.use('/', _router)

  // router not found
  app.use(function (req, res, next) {
    res.status(404).json({
      message: 'Not Found'
    })
  })

  // Error Handler
  app.use(function (err, req, res, next) {
    res.status(500).json({
      message: err.message,
      status: 500
    })
  })
}
