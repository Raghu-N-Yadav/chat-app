const socket = io()

//elements for form
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

// elements for form button
const $sendLocationButton = document.querySelector('#send-location')
//elements
const $messages = document.querySelector('#messages')

//templates
const messagesTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//setting autoscroo
const autoScroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of new element
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // console.log(newMessageMargin)

    //visible height
    const visibleHeight = $messages.offsetHeight

    ///height of messages container
    const containerHeight = $messages.scrollHeight

    //how far user scorlled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

//listeaning to client
socket.on('clientMessage', (str) => {
    console.log(str);
    //rendering message to div sections
    const html = Mustache.render(messagesTemplate, {
        username: str.username,
        message: str.text,
        createdAt: moment(str.createdAt).format('h: mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll()
})

//liteaning to location message event
socket.on('locationMessage', (location) => {
    console.log(location)
    //using mustache libray to render template
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        //using moment library to format date
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()

})

//listen to server event roomData
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//code runs when form get submit
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disabling button after submitting 
    $messageFormButton.setAttribute('disabled', 'disabled')

    //saving form info
    // const message = document.querySelector('input').value
    const message = e.target.elements.input1.value

    //sending form info to server
    socket.emit('sendMessage', message, (msg) => {

        //enabling button after sening message
        $messageFormButton.removeAttribute('disabled')
        //clearning the input string 
        $messageFormInput.value = ''
        //seting cursor inside
        $messageFormInput.focus()

        if (msg) {
            return console.log(msg)
        }

        console.log('Message delivered to serevr ')
    })
})

//code run when user click send location
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geo location not supported by this browser')
    }

    //disable button while fetching location 
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        // const latitude = position.coords.latitude
        // const longitude = position.coords.longitude
        // console.log(latitude, longitude)

        //sending location to server
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            //enabling location button 
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })


    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})




// socket.on('updatedCount', (count) => {
//     console.log('Count Value', count);
// });

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Button clicked');
//     socket.emit('increment');
// })