const socket = io()

//elements
const $form = document.querySelector('form')
const $input = $form.querySelector('input')
const $send = $form.querySelector('button')
const $messages = document.getElementById('messages')
const $locationButton = document.getElementById('send-location')
const $sidebar = document.getElementById('sidebar')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

$form.addEventListener('submit', e => {
  e.preventDefault()

  $send.disabled = true

  const message = e.target.elements.message.value

  if (!message) {
    return ($send.disabled = false)
  }

  socket.emit('addMessage', message, () => {
    $input.value = ''
    $input.focus()

    $send.disabled = false
  })
})

socket.on('usersList', ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users
  })

  $sidebar.innerHTML = html
})

socket.on('newMessage', ({ text, createdAt, username }) => {
  const html = Mustache.render(messageTemplate, {
    message: text,
    createdAt: moment(createdAt).format('h:mm a'),
    username
  })

  $messages.insertAdjacentHTML('afterbegin', html)
})

socket.on('newLocation', ({ text, createdAt, username }) => {
  const html = Mustache.render(locationTemplate, {
    location: text,
    createdAt: moment(createdAt).format('h:mm a'),
    username
  })

  $messages.insertAdjacentHTML('afterbegin', html)
})

$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('geolocation is not supported by your browser')
  }

  $locationButton.disabled = true

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        $locationButton.disabled = false
      }
    )
  })
})

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})
