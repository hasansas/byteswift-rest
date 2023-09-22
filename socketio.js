/**
 * Socket.IO
 */

'use strict'

export default function (httpServer) {
  global.IO = require('socket.io')(httpServer, {
    cors: {
      origin: '*'
    }
  })

  IO.on('connection', (socket) => {
    const _clientId = socket.id

    console.log(`a user ${_clientId} connected`)
    IO.to(_clientId).emit('connected', _clientId)

    socket.on('connected', function (userId) {
      socket.data.userId = userId
    })

    socket.on('disconnect', () => {
      console.log(`a user ${_clientId} disconnected`)
    })

    // TODO: add onAny for development mode
    socket.onAny((event, ...args) => {
      console.log(event, args)
    })
  })
}
