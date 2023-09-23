/**
 * Disk Storage
 */

import path from 'path'
import { allowedTypes } from '../config/fileUpload'

class DiskStorage {
  publicUrl () {
    let storageUrl = ENV.APP_URL + '/media'

    if (ENV.DISK_STORAGE === 'gcs') {
      storageUrl = ENV.GCS_PUBLIC_URL + '/' + ENV.GCS_BUCKET
    }
    return storageUrl
  }

  url ({ parentDir, fileName }) {
    let url = null
    if (fileName != null) {
      const extensionName = path.extname(fileName)
      const fileTypes = Object.keys(allowedTypes)
      const filePath = fileTypes.find(k => allowedTypes[k].find(e => e === extensionName))
      url = typeof filePath !== 'undefined'
        ? this.publicUrl() + '/' + parentDir + '/' + filePath + 's/' + fileName.replace(/\s/g, '-')
        : url
    }
    return {
      name: fileName,
      url
    }
  }
}

export default () => new DiskStorage()
