/**
 * Main application file
 */

'use strict'

import express from 'express'
import path from 'path'
import http from 'http'
import cors from 'cors'
import configExpress from './config/express'
import router from './router'
import socketIO from './socketio'
import auth from './middleware/auth'

const app = express()
const httpServer = http.createServer(app)

/****************************************
*       Global definition
****************************************/

// Global ROOT_DIR
global.ROOT_DIR = path.resolve(__dirname, './')

// Loading config from .env
global.ENV = require('dotenv').config({ path: path.resolve(ROOT_DIR, '.env') }).parsed

// Auth Middleware
global.AUTH = auth

// Database
global.DB = require('./database/models')

// Whatsapp
global.WA_CLIENTS = []

/****************************************
*         Socket IO
****************************************/

socketIO(httpServer)

/****************************************
*         Configuring express
****************************************/

// Load express configurations
configExpress(app)

// Cors
app.use(cors())

// Load router
router(app)

/****************************************
*           Running Web Server
*****************************************/

// Start server
httpServer.listen(ENV.APP_PORT, () => {
  console.log(`App listening on port ${ENV.APP_PORT}`)
})
