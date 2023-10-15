/**
 * IO Message
 */

'use strict'

const ioMessage = async function ({ name, clientId, message }) {
  try {
    const sockets = await IO.fetchSockets()
    const clientSock = sockets.filter(item => item.data.userId === clientId)
    if (typeof clientSock !== 'undefined') {
      clientSock.forEach(item => {
        IO.to(item.id).emit(name, message)
      })
    }
  } catch (error) {
    console.log(error)
  }
}

export default ioMessage
