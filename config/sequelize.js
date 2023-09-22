/**
 * Sequelize Configuration
 */

'use strict'

require('dotenv').config()

const {
  DB_CONNECTION,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  DB_ENABLE_SSL
} = process.env
const dbEnableSLL = DB_ENABLE_SSL === 'true' ?? false

module.exports = {
  development: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_CONNECTION,
    ssl: dbEnableSLL,
    dialectOptions: {
      ssl: dbEnableSLL && {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_CONNECTION,
    ssl: dbEnableSLL,
    dialectOptions: {
      ssl: dbEnableSLL && {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  },
  production: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_CONNECTION,
    ssl: dbEnableSLL,
    dialectOptions: {
      ssl: dbEnableSLL && {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  }
}
