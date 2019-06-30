import express from 'express'
import router from './router.js'
import http from 'http'
import socketio from 'socket.io'
import Filter from 'bad-words'

const app = express()
const server = http.createServer(app)
const io = socketio(server)

function generateMessage(text) {
  return {
    text,
    createdAt: new Date()
  }
}

io.on('connection', socket => {
  console.log('socket io new connection')

  socket.emit('newMessage', generateMessage('welcome'))

  socket.broadcast.emit('newMessage', generateMessage('a new user has joined!'))

  socket.on('addMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('error')
    }
    io.emit('newMessage', generateMessage(message))
    callback()
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit(
      'newMessage',
      generateMessage('a user has diconnected')
    )
  })

  socket.on('sendLocation', (position, callbacl) => {
    io.emit(
      'newLocation',
      generateMessage(
        `https://google.com/maps?q=${position.latitude},${position.longitude}`
      )
    )
    callbacl('done')
  })
})

router(app, express)

const port = process.env.PORT
server.listen(port, () => console.log(`🚀  server is running @port ${port}`))
