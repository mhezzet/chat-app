import express from 'express'
import router from './router.js'
import http from 'http'
import socketio from 'socket.io'
import Filter from 'bad-words'

const app = express()
const server = http.createServer(app)
const io = socketio(server)

function generateMessage(text, username) {
  return {
    text,
    createdAt: new Date(),
    username
  }
}

const users = []

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  if (!username || !room) return { error: 'username or room missing' }

  const userExist = users.find(
    user => user.room === room && user.username === username
  )

  if (userExist) return { error: 'username is already exist' }

  const user = { id, username, room }
  users.push(user)

  return { user }
}

const removeUser = id => {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) return users.splice(index, 1)[0]
}

const getUser = id => {
  return users.find(user => user.id === id)
}
const getUsersInRoom = room => {
  return users.filter(user => user.room === room)
}

io.on('connection', socket => {
  console.log('socket io new connection')

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options })

    if (error) {
      callback(error)
      return
    }

    socket.join(user.room)

    socket.emit('newMessage', generateMessage('welcome', 'chat app'))
    socket.broadcast
      .to(user.room)
      .emit(
        'newMessage',
        generateMessage(`${user.username} has joined`, 'chat app')
      )
    const users = getUsersInRoom(user.room)

    io.to(user.room).emit('usersList', { room: user.room, users })

    callback()
  })

  socket.on('addMessage', (message, callback) => {
    const user = getUser(socket.id)

    const filter = new Filter()

    io.to(user.room).emit(
      'newMessage',
      generateMessage(filter.clean(message), user.username)
    )
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      socket.broadcast
        .to(user.room)
        .emit(
          'newMessage',
          generateMessage(`${user.username} has diconnected`, 'chat app')
        )

      io.to(user.room).emit('usersList', { room: user.room, users })
    }
  })

  socket.on('sendLocation', (position, callbacl) => {
    const user = getUser(socket.id)

    io.to(user.room).emit(
      'newLocation',
      generateMessage(
        `https://google.com/maps?q=${position.latitude},${position.longitude}`,
        user.username
      )
    )
    callbacl('done')
  })
})

router(app, express)

const port = process.env.PORTAL
server.listen(port, () => console.log(`🚀  server is running @port ${port}`))
