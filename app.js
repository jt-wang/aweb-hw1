"use strict";

const _ = require('lodash')
const moment = require('moment')

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const low = require('lowdb')

const db = low('db.json')



app.get('/', function(req, res) {
  res.send('Hello, World!')
})

let contacts = []

let robots = [{
    name: 'Vincent Porter',
    avatar_chat: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg',
    avatar_contact: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg',
    online: true,

  }, {
    name: 'Aiden Chavez',
    avatar_chat: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_02_green.jpg',
    avatar_contact: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_02.jpg',
    online: false
  }, {
    avatar_chat: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_03_green.jpg",
    avatar_contact: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_03.jpg",
    name: 'Mike Thomas',
    online: true,
  }, {
    avatar_chat: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_04_green.jpg",
    avatar_contact: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_04.jpg",
    name: 'Erica Hughes',
    online: false
  },

  {
    avatar_chat: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_05_green.jpg",
    avatar_contact: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_05.jpg",
    name: 'Ginger Johnston',
    online: true,
  },


  {
    avatar_chat: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_06_green.jpg",
    avatar_contact: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_06.jpg",
    name: 'Tracy Carpenter',
    online: true
  }
]

// const preset_messages = [
//     'hi there!',
//     'No matter what you say, I believe PHP is the best programming language',
//     'Okay...you create this app, but JavaScript is still horrible in my mind.',
//     'Why do you have to use frameworks? I write everything by myself.',
//     'Sometimes... I wonder if there is anybody who can totally understand C++.',
//     'You know I am a robot, but I have feelings though.'

//     ]


io.on('connection', function(socket) {
  console.log('a user connected')
  socket.on('disconnect', function() {
    console.log('user disconnected')
    if (_.has(socket, 'current_username')){
    let index = _.findIndex(contacts, (o) => {return o.name === socket.current_username})
    if (index !== -1) {
      contacts.splice(index, 1)
      io.emit('update_contacts', contacts)
    }
    }
  })

  socket.on('logout', function() {
    console.log(socket.current_username + ' logout')
    console.log('socket.current_username: ' + socket.current_username)
    let index = _.findIndex(contacts, (o) => {return o.name === socket.current_username})
    console.log('reach here')
    if (index !== -1) {
      contacts.splice(index, 1)
      io.emit('update_contacts', contacts)
    }
  })

  socket.on('login', function(data) {
    console.log(data.username + ' login')
    let index = _.findIndex(contacts, (o) => {return o.name === data.username})
    socket.current_username = data.username
    if (index === -1) {
      let sample = _.sample(robots)
      contacts.push({socket: socket, name: data.username, avatar_chat: sample.avatar_chat, avatar_contact: sample.avatar_contact, online: true}) 
    } else {
      contacts[index].socket = socket
      contacts[index].online = true
    }

    socket.emit('login_success')
    io.emit('update_contacts', _.map(contacts, (o) => {return _.pick(o, ['name', 'avatar_chat', 'avatar_contact', 'online'])}))
  })

  socket.on('client_message', function(message) {
    // console.log(data)
    let receiver = message.receiver
    let index = _.findIndex(contacts, (o) => {return o.name === receiver})
    if (index !== -1) {
      if (contacts[index].online) {
            // let random_message_content = _.sample(preset_messages)
    // let message_time = moment().calendar()
    // let server_message = {sender: sender, receiver: message.sender, content: message.content, time: message_time}
    // socket.emit('server_message', message)
    
        contacts[index].socket.emit('server_message', message)
      }
    }


  })


});


// app.post('/register', function (req, res) {
//   const user = db.get('users').find({username: req.params.username}).value()
//   res.send({status:(typeof user === 'undefined')})
// })

http.listen(3000, function() {
  console.log('app listen on port 3000!')
})