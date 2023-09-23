/**
 * File Upload
 */

'use strict'

import path from 'path'
import fileUpload from 'express-fileupload'

const maxFileSize = 2 // MB

export const upload = fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 1024 * 1024 * maxFileSize
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: path.join(path.resolve(__dirname, '../'), '/.tmp')
})

export const allowedTypes = {
  image: ['.png', '.jpg', '.jpeg', '.webp'],
  document: ['.doc', '.pdf', '.xlsx', '.xls'],
  video: ['.mp4']
}
