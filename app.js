'use strict'
const express = require('express')
const config = require('./config/config')
const db = require('./app/models')

const app = express()

require('./config/express')(app, config)
const http = require('http').Server(app)
const io = require('socket.io')(http)

require('./app/io/index')(io)

http.listen(3000, function () {
  console.log('Express server and socket.io listening on port ' + config.port)
})

//   }).catch(function (e) {
//     throw new Error(e);
//   });
//
