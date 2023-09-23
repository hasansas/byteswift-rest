'use strict'

import { sync } from 'glob'

const path = require('path')
const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const config = require(path.join(ROOT_DIR, '/config/sequelize.js'))[env]
const sequalizeConfig = {
  ...config,
  ...{
    logging: false,
    define: {
      underscored: true,
      underscoredAll: true
    }
  }
}
const db = {}

let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], sequalizeConfig)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, sequalizeConfig)
}

sync(path.join(ROOT_DIR, '/api/**/**/models/*_model.js')).forEach(function (file) {
  const model = require(file)(sequelize, Sequelize.DataTypes)
  db[model.name] = model
})

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
