const socket = io()

//elements
const $form = document.querySelector('form')
const $input = $form.querySelector('input')
const $send = $form.querySelector('button')
const $messages = document.getElementById('messages')
const $locationButton = document.getElementById('send-location')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

$form.addEventListener('submit', e => {
  e.preventDefault()

  $send.disabled = true

  const message = e.target.elements.message.value

  if (!message) {
    return ($send.disabled = false)
  }

  $form.setAttribute('disabled', true)
  socket.emit('addMessage', message, () => {
    $input.value = ''
    $input.focus()

    $send.disabled = false
  })
})

socket.on('newMessage', ({ text, createdAt }) => {
  const html = Mustache.render(messageTemplate, {
    message: text,
    createdAt: moment(createdAt).format('h:mm a')
  })

  $messages.insertAdjacentHTML('afterbegin', html)
})

socket.on('newLocation', ({ text, createdAt }) => {
  const html = Mustache.render(locationTemplate, {
    location: text,
    createdAt: moment(createdAt).format('h:mm a')
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
