/**
 * Upload Controller
 */

'use strict'

import path from 'path'
import { allowedTypes } from '../../config/fileUpload'
import Storage from '../../libs/storage'

class UploadController {
  constructor ({ req, res }) {
    this.request = req
    this.query = req.query
    this.res = res
    this.storage = Storage()
  }

  /**
   * Upload
   *
   * @param {File} file
   * @param {string} parentDir
   * @return {Object} HTTP Response
   */
  async store () {
    try {
      // Validate request
      if (!this.request.files) {
        const _error = {
          message: 'No file were uploaded'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // request
      const authUser = this.request.authUser
      const file = this.request.files.file
      const parentDir = this.request.body.parentDir || 'users'

      // Get allowed extension
      const extensionName = path.extname(file.name)
      const fileTypes = Object.keys(allowedTypes)
      let allowedExtension = []
      fileTypes.forEach(element => {
        allowedExtension = allowedExtension.concat(allowedTypes[element])
      })

      if (!allowedExtension.includes(extensionName)) {
        const _error = {
          message: 'Sorry, this file type is not permitted'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // Allowed directory
      const allowedDirectory = ['users', 'site']

      if (!allowedDirectory.includes(parentDir)) {
        const _error = {
          message: 'This parent directory is not permitted'
        }
        return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.badRequest, error: _error })
      }

      // File name
      const prefixfileName = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const fileName = prefixfileName + '-' + file.name.replace(/\s/g, '-')

      // Upload path
      const parentPath = parentDir === 'users' ? parentDir + '/' + authUser.id : parentDir
      const filePath = fileTypes.find(k => allowedTypes[k].find(e => e === extensionName))
      const uploadtTo = parentPath + '/' + filePath + 's'
      const uploadtPath = path.join(ROOT_DIR, '/storage/' + uploadtTo + '/') + fileName

      // move file to storage path
      file.mv(uploadtPath, (err) => {
        if (err) {
          return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: err })
        }

        const fileInfo = this.storage.fileInfo({ parentDir: parentPath, fileName: fileName })
        return SEND_RESPONSE.success({ res: this.res, statusCode: HTTP_RESPONSE.status.ok, data: fileInfo })
      })
    } catch (error) {
      return SEND_RESPONSE.error({ res: this.res, statusCode: HTTP_RESPONSE.status.internalServerError, error: error })
    }
  }
}
export default ({ req, res }) => new UploadController({ req, res })
