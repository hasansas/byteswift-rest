/**
 * Users Controller
 */

'use strict'

import bcrypt from 'bcrypt'
import moment from 'moment'
import axios from 'axios'
import JWTR from 'jwt-redis'
import stringHex from '../../helpers/string_hex'
import mail from '../../helpers/mail'
import roleMiddleware from '../../middleware/role'
import SequalizePagintaion from '../../libs/sequalize_pagintaion'
import Storage from '../../libs/storage'
import Redis from '../../libs/redis'

class UsersController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.usersModel = DB.users
    this.usersInfoModel = DB.usersInfo
    this.rolesModel = DB.roles
    this.usersRolesModel = DB.usersRoles
    this.userVerificationsModel = DB.userVerifications
    this.clientsModel = DB.clients
    this.packagesModel = DB.packages
    this.clientsPackagesModel = DB.clientsPackages
    this.storage = Storage()
    this.redis = Redis()
  }

  /**
   * Register User
   *
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @return {Object} HTTP Response
   */
  async register () {
    try {
      // validate request
      const errors = EXPRESS_VALIDATOR.validationResult(this.request)
      if (!errors.isEmpty()) {
        const _error = {
          errors: errors.array()
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // save data
      const _salt = await bcrypt.genSalt(10)
      const _name = this.request.body.name
      const _email = this.request.body.email
      const _password = await bcrypt.hash(this.request.body.password, _salt)
      const _role = 'user'
      const _data = {
        name: _name,
        email: _email,
        password: _password
      }

      // create user
      const _createUser = await this.createUser(_data, _role)
      if (!_createUser.success) {
        return SEND_RESPONSE.error({ res: this.res, statusCode: _createUser.errorCode, error: _createUser.error })
      }

      // create confirmation code
      const _confirmationCode = Math.floor(100000 + Math.random() * 900000)
      const _expiredCodeAt = moment().add(24, 'hours').toISOString()
      const _createConfirmationCode = await this.userVerificationsModel.create({
        userId: _createUser.data.id,
        token: _confirmationCode,
        expiredAt: _expiredCodeAt,
        verificationType: 'email'
      })
      if (!_createConfirmationCode.success) {
        // TODO: return create code error
      }

      // send email confirmation code
      const _mailTo = _email
      const _mailTemplate = 'register'
      const _mailData = { name: _name, confirmation_code: _confirmationCode }
      const _sendMail = await mail.send(_mailTo, _mailTemplate, _mailData)
      if (!_sendMail) {
        // TODO: return email error
      }

      // send telegram confirmation code (group dev)
      const _emailHost = _email.split('@')[1]
      const _emailDev = 'dev.edumo.com'
      if (_emailHost === _emailDev) {
        const telegramMessageText = `Confirmation code for ${_email} ${_confirmationCode}`
        const sendTelegramMessageUrl = ENV.TELE_API_URL + '/bot' + ENV.TELE_BOT_TOKEN + '/sendMessage?chat_id=' + ENV.TELE_GROUP_ID + '&text=' + telegramMessageText

        await axios.post(sendTelegramMessageUrl)
      }

      // success response
      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.created })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Create User
   *
   * @param {Object} user userModel
   * @param {string} role
   * @return {Object} HTTP Response
   */
  async createUser (user, role) {
    try {
      // check role
      if (!role) {
        return {
          success: false,
          errorCode: HTTP_RESPONSE.status.badRequest,
          error: { message: 'Role required' }
        }
      }

      const _role = await this.rolesModel.findOne({
        where: {
          name: role
        }
      })
      if (_role === null) {
        return {
          success: false,
          errorCode: HTTP_RESPONSE.status.badRequest,
          error: { message: 'Invalid role' }
        }
      }

      // create user
      const result = await DB.sequelize.transaction(async (t) => {
        const _createUser = await this.usersModel.create(user, { transaction: t })
        const userId = _createUser.dataValues.id

        // attach user role
        const _userRole = { userId, roleId: _role.id }
        await this.usersRolesModel.create(_userRole, { transaction: t })

        // attach user info
        await this.usersInfoModel.create({ userId }, { transaction: t })

        // success response
        return { success: true, data: _createUser.dataValues }
      })
      return result
    } catch (error) {
      return {
        success: false,
        errorCode: HTTP_RESPONSE.status.internalServerError,
        error
      }
    }
  }

  /**
   * Confirm Register
   *
   * @param {string} email
   * @param {string} code
   * @return {Object} HTTP Response
   */
  async confirmRegister () {
    try {
      // validate request
      const errors = EXPRESS_VALIDATOR.validationResult(this.request)
      if (!errors.isEmpty()) {
        const error = {
          errors: errors.array()
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error })
      }

      // validate user
      const _email = this.request.body.email
      const _user = await this.usersModel.findOne({ where: { email: _email } })
      if (_user === null) {
        const _error = {
          message: 'User not found'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      if (_user.active && _user.isEmailVerified) {
        const _error = {
          message: 'Account already verified'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // validate confirmation code
      const _code = this.request.body.code
      const _userVerification = await this.userVerificationsModel.findOne({ where: { user_id: _user.id, token: _code } })
      if (_userVerification === null) {
        const _error = {
          message: 'Invalid confirmation code.'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      if (new Date() > _userVerification.expiredAt) {
        const _error = {
          message: 'The confirmation code was expired.'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // update user
      await this.usersModel.update(
        { active: true, isEmailVerified: true },
        { where: { id: _user.id } }
      )

      // delete token
      await this.userVerificationsModel.destroy({ where: { id: _userVerification.id } })

      // success response
      SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Login User
   *
   * @param {string} email
   * @param {string} password
   * @return {Object} HTTP Response
   */
  async login () {
    try {
      // validate request
      const errors = EXPRESS_VALIDATOR.validationResult(this.request)
      if (!errors.isEmpty()) {
        const error = {
          errors: errors.array()
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error })
      }

      // perfom login
      const _bcrypt = require('bcrypt')
      const _email = this.request.body.email
      const _password = stringHex.fromHex(this.request.body.password)

      // check user credential
      const user = await this.usersModel.findOne({
        where: { email: _email },
        attributes: ['id', 'password', 'active'],
        include: [{
          model: this.rolesModel,
          attributes: ['name'],
          through: { attributes: [] }
        }]
      })

      if (!user) {
        return SEND_RESPONSE.error({
          res: this.res,
          statusCode: HTTP_RESPONSE.status.badRequest,
          error: { message: 'Email not registered' }
        })
      }

      const validPassword = await _bcrypt.compare(_password, user.password)
      if (!validPassword) {
        const _error = {
          message: 'Incorect password'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      if (!user.active) {
        const _error = {
          message: 'User not activated'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // Check role
      const _role = this.request.params.role
      const _roles = user.roles.map((item) => {
        return item.name
      })

      if (!_roles.includes(_role)) {
        const _error = {
          message: 'Role not granted or does not exist'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // redis connect
      const redis = Redis()
      const connect = await redis.connect()
      if (!connect.success) {
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: connect.error })
      }
      const redisClient = connect.client

      // create token
      const jwtr = new JWTR(redisClient)
      const _jwtSecret = ENV.JWT_SECRET
      const _payload = { id: user.id, role: _role, jti: user.id }
      const _token = await jwtr.sign(_payload, _jwtSecret, { expiresIn: 525600, algorithm: 'HS256' })

      // response
      SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok, data: { token: _token } })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * auth Google
   *
   * @param {string} email
   * @param {string} password
   * @return {Object} HTTP Response
   */
  async authGoogle () {
    try {
      const vm = this

      // validate request
      const errors = EXPRESS_VALIDATOR.validationResult(this.request)
      if (!errors.isEmpty()) {
        const error = {
          errors: errors.array()
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error })
      }

      // get access token
      const authGoogleApiTokenUrl = ENV.AUTH_GOOGLE_API_TOKEN_URL
      const authGoogleApiUserInfoUrl = ENV.AUTH_GOOGLE_API_USERINFO_URL
      const postData = {
        grant_type: 'authorization_code',
        client_id: ENV.AUTH_GOOGLE_CLIENT_ID,
        client_secret: ENV.AUTH_GOOGLE_CLIENT_SECRET,
        redirect_uri: this.request.body.redirect_uri,
        code: this.request.body.code
      }

      return axios.post(authGoogleApiTokenUrl, postData)
        .then(async function (response) {
          const responseData = response.data
          const accessToken = responseData.access_token

          // get user info
          return axios.get(`${authGoogleApiUserInfoUrl}/me?access_token=${accessToken}`)
            .then(async function (response) {
              const _role = 'user'
              const _googleUser = response.data

              // get user
              let _user = await vm.usersModel.findOne({ where: { email: _googleUser.email } })

              // create user if not exist
              if (_user === null) {
                // create new user
                const _userName = _googleUser.name
                const _userEmail = _googleUser.email
                const _userImage = _googleUser.picture
                const _data = {
                  name: _userName,
                  email: _userEmail,
                  image: _userImage,
                  loginFrom: 'google',
                  isEmailVerified: true,
                  active: true
                }

                const _createUser = await vm.createUser(_data, _role)
                if (!_createUser.success) {
                  return SEND_RESPONSE.error({ res: vm.res, statusCode: _createUser.errorCode, error: _createUser.error })
                }

                // set user data
                _user = _createUser.data

                // send email registration success
                const _mailTo = _userEmail
                const _mailTemplate = 'register_success'
                const _mailData = { name: _userName }
                const _sendMail = await mail.send(_mailTo, _mailTemplate, _mailData)
                if (!_sendMail) {
                  // TODO: return email error
                }
              }

              // redis connect
              const redis = Redis()
              const connect = await redis.connect()
              if (!connect.success) {
                return SEND_RESPONSE.error({ res: vm.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: connect.error })
              }
              const redisClient = connect.client

              // create token
              const jwtr = new JWTR(redisClient)
              const _jwtSecret = ENV.JWT_SECRET
              const _payload = { id: _user.id, role: _role, jti: _user.id }
              const _token = await jwtr.sign(_payload, _jwtSecret, { expiresIn: 525600, algorithm: 'HS256' })

              // response
              SEND_RESPONSE.success({ res: vm.res, statusCode: HTTP_RESPONSE.status.ok, data: { token: _token } })
            })
            .catch(function (error) {
              const _error = error.response.data
              return SEND_RESPONSE.error({ res: vm.res, statusCode: HTTP_RESPONSE.status.badRequest, error: { message: _error } })
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
   * Logout User
   *
   * @return {Object} HTTP Response
   */
  async logout () {
    try {
      // redis connect
      const redis = Redis()
      const connect = await redis.connect()
      if (!connect.success) {
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: connect.error })
      }
      const redisClient = connect.client

      // destory token
      const jwtr = new JWTR(redisClient)
      const jti = this.request.authUser.jti
      const _jwtSecret = ENV.JWT_SECRET
      await jwtr.destroy(jti, _jwtSecret)

      // response
      SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Logout User (all devices)
   *
   * @return {Object} HTTP Response
   */
  async logoutAllDevices () {
    try {
      SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.notImplement })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Display a listing of the resource.
   *
   * @return {Object} HTTP Response
   */
  async index () {
    try {
      // Role authorization
      roleMiddleware({ req: this.request, res: this.res, allowedRoles: ['developer', 'superadmin', 'admin', 'client'] })

      // Get data
      const sequalizePagintaion = SequalizePagintaion(this.request)
      return this.usersModel
        .findAndCountAll({
          include: [{
            model: this.usersInfoModel,
            attributes: ['dateOfBirth', 'placeOfBirth', 'gender']
          }],
          offset: sequalizePagintaion.offset(),
          limit: sequalizePagintaion.limit,
          order: [
            ['createdAt', 'DESC']
          ]
        })
        .then((data) => {
          const _data = {
            total: data.total,
            rows: data.rows.map(data => {
              const _paretDir = 'users/' + data.id
              data.image = this.storage.url({ parentDir: _paretDir, fileName: data.image })
              return data
            })
          }
          const resData = sequalizePagintaion.paginate(_data)

          return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok, data: resData })
        })
        .catch((error) => {
          return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
        })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Display my profile.
   *
   * @return {Object} HTTP Response
   */
  async me () {
    try {
      // Get data
      console.log(this.request.authUser.id)
      return this.usersModel
        .findOne({
          where: {
            id: this.request.authUser.id
          },
          include: [{
            model: this.usersInfoModel,
            attributes: ['dateOfBirth', 'placeOfBirth', 'gender']
          }]
        })
        .then((data) => {
          if (data !== null) {
            const _paretDir = 'users/' + data.id
            data.image = this.storage.url({ parentDir: _paretDir, fileName: data.image })
          }
          return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok, data })
        })
        .catch((error) => {
          return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
        })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }

  /**
   * Update my profile.
   *
   * @return {Object} HTTP Response
   */
  async update () {
    try {
      // Update user
      let userAttributes = {}

      if (this.request.body.name) {
        userAttributes = { ...userAttributes, ...{ name: this.request.body.name } }
      }
      if (this.request.body.image) {
        userAttributes = { ...userAttributes, ...{ image: this.request.body.image } }
      }
      await this.usersModel.update(
        userAttributes,
        { where: { id: this.request.authUser.id } }
      )

      // Update user info
      let userInfoAttributes = {}
      if (this.request.body.dateOfBirth) {
        userInfoAttributes = { ...userInfoAttributes, ...{ dateOfBirth: this.request.body.dateOfBirth } }
      }
      if (this.request.body.placeOfBirth) {
        userInfoAttributes = { ...userInfoAttributes, ...{ placeOfBirth: this.request.body.placeOfBirth } }
      }
      if (this.request.body.gender) {
        userInfoAttributes = { ...userInfoAttributes, ...{ gender: this.request.body.gender } }
      }
      const _userInfo = await this.usersInfoModel.findOne({ where: { user_id: this.request.authUser.id } })

      if (_userInfo !== null) {
        await this.usersInfoModel.update(
          userInfoAttributes,
          { where: { user_id: this.request.authUser.id } }
        )
      } else {
        await this.usersInfoModel.create(
          { ...{ user_id: this.request.authUser.id }, ...userInfoAttributes }
        )
      }
      // success response
      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error })
    }
  }
}
export default ({ req, res }) => new UsersController({ req, res })
