
var express = require('express'),
  config = require('./config/config'),
  db = require('./app/models')

var app = express()

require('./config/express')(app, config)
//
// db.sequelize
//   .sync()
//   .then(function () {
var http = require('http').Server(app)
var io = require('socket.io')(http)

// app.listen(config.port, function () {
//   console.log('Express server listening on port ' + config.port)
// })
io.on('connection', function (socket) {
  // console.log('a user connected')
  // socket.on('my other event', function (data) {
  //   console.log(data)
  // })
})
io.emit('news', { hello: 'world' })

http.listen(3000, function () {
  console.log('Express server and socket.io listening on port ' + config.port)
})

//   }).catch(function (e) {
//     throw new Error(e);
//   });
//
