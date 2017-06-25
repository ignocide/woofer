'use strict'

const Promise = require('bluebird')

var api = {}

// middleware runner
api.runner = function () {
  var args = Array.prototype.slice.call(arguments)

  var socket = args.shift()
  var io = args.shift()
  var data = args.shift()
  data.locals = {}
  var tasks = args

  return Promise.mapSeries(tasks, function (task) {
    return task(socket, io, data)
  })
    .then(function () {
      return Promise.resolve(data)
    })
}

api.teamCallback = function (funcName) {
  return function (socket, io, data) {
    io.to(socket.room).emit(funcName)
  }
}

api.callback = function (funcName) {
  return function (socket, io, data) {
    socket.emit(funcName)
  }
}

module.exports = api
