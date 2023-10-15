/**
* Clients Configurations Controller
*/

'use strict'

import roleMiddleware from '../../middleware/role'

class ClientsConfigurationsController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.clientsModel = DB.clients
  }

  /**
    * Display a listing of the resource.
    *
    * @return {Object} HTTP Response
    */
  async index () {
    try {
      // success response
      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.notImplement })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: error })
    }
  }

  /**
   * Display the specified resource.
   *
   * @return {Object} HTTP Response
   */
  async show () {
    try {
      // success response
      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.notImplement })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: error })
    }
  }

  /**
   * Display the specified resource by token.
   *
   * @return {Object} HTTP Response
   */
  async showMe () {
    try {
      // Role authorization
      roleMiddleware({ req: this.request, res: this.res, allowedRoles: ['client'] })

      return this.clientsModel
        .findOne({
          where: {
            userId: this.request.authUser.id
          },
          attributes: ['serverKey', 'clientKey']
        })
        .then((data) => {
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
   * Store a newly created resource in storage.
   *
   * @return {Object} HTTP Response
   */
  async store () {
    try {
      // success response
      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.notImplement })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: error })
    }
  }

  /**
   * Update the specified resource in storage.
   *
   * @return {Object} HTTP Response
   */
  async update () {
    try {
      // success response
      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.notImplement })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: error })
    }
  }

  /**
   * Remove the specified resource from storage.
   *
   * @return {Object} HTTP Response
   */
  async delete () {
    try {
      // success response
      return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.notImplement })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: error })
    }
  }
}
export default ({ req, res }) => new ClientsConfigurationsController({ req, res })
