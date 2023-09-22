/**
 * ACK helpers
 */

export default function messageAck (ack) {
  const messageAck = {
    ACK_ERROR: -1,
    ACK_PENDING: 0,
    ACK_SERVER: 1,
    ACK_DEVICE: 2,
    ACK_READ: 3,
    ACK_PLAYED: 4
  }

  const _ack = Object.entries(messageAck).find(i => i[1] === ack)
  if (typeof _ack === 'undefined') {
    return 'undefined'
  }

  return _ack[0]
}
