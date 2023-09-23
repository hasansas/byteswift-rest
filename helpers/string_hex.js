/**
 * String helpers
 */

export const toHex = function (str) {
  return Array.from(str).map(c =>
    c.charCodeAt(0) < 128
      ? c.charCodeAt(0).toString(16).padStart(2, '0')
      : encodeURIComponent(c).replace(/%/g, '').toLowerCase()
  ).join('')
}

const fromHex = function (hex) {
  return decodeURIComponent('%' + hex.match(/.{1,2}/g).join('%'))
}

const stringHex = {
  toHex,
  fromHex
}

export default stringHex
