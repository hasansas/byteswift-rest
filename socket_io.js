/**
 * Socket.IO
 */

'use strict'

export default function (httpServer) {
  global.IO = require('socket.io')(httpServer, {
    cors: {
      // origin: "http://localhost:36459",
      origin: '*'
    }
  })

  IO.on('connection', (socket) => {
    const _clientId = socket.id
    console.log(`a user ${_clientId} connected`)
    socket.on('disconnect', () => {
      console.log(`a user ${_clientId} disconnected`)
    })

    socket.on('broadcast', (msg) => {
      console.log('message: ' + msg)
      IO.emit('broadcast', msg)
    })

    // TODO: add onAny for development mode
    socket.onAny((event, ...args) => {
      console.log(event, args)
    })
  })
}
