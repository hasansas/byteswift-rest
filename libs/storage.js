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

  fileInfo ({ parentDir = 'users', fileName }) {
    let url = null
    let name = null
    if (fileName != null) {
      // get url
      const extensionName = path.extname(fileName)
      const fileTypes = Object.keys(allowedTypes)
      const filePath = fileTypes.find(k => allowedTypes[k].find(e => e === extensionName))
      url = typeof filePath !== 'undefined'
        ? this.publicUrl() + '/' + parentDir + '/' + filePath + 's/' + fileName.replace(/\s/g, '-')
        : url

      // get name
      const fileNameToDash = fileName.replaceAll('_', '-')
      const fileNameToArray = fileNameToDash.split('-')
      const fileNamePrefixRemoved = fileNameToArray.slice(2)
      name = fileNamePrefixRemoved.join('-').replaceAll('-', ' ').toLowerCase()
    }
    return {
      name: name,
      fileName: fileName,
      url
    }
  }

  filePath ({ parentDir = 'users', fileName }) {
    const extensionName = path.extname(fileName)
    const fileTypes = Object.keys(allowedTypes)
    const parentPath = fileTypes.find(k => allowedTypes[k].find(e => e === extensionName))
    const filePath = typeof parentPath !== 'undefined'
      ? path.join(ROOT_DIR, `/storage/${parentDir}`) + '/' + parentPath + 's/' + fileName.replace(/\s/g, '-')
      : null

    return filePath
  }
}

export default () => new DiskStorage()
