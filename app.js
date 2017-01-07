'use strict'

const express = require('express')
const config = require('./config/config')

const app = express()

require('./config/express')(app, config)
const http = require('http').Server(app)
const io = require('socket.io')(http)

require('./app/io/index')(io)

http.listen(config.port, function () {
  console.log('Express server and socket.io listening on port ' + config.port)
})
