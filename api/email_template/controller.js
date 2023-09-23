/**
 * Packages Controller
 */

'use strict'

class EmailTemplatesController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.packagesModel = DB.packages
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
}
export default ({ req, res }) => new EmailTemplatesController({ req, res })
