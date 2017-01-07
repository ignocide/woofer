'use strict'

const Promise = require('bluebird')
const redis_playlist = require('../redis/playlist')

var PLAYLIST = function () {}

PLAYLIST.prototype.add = function (socket, io, data) {
  let video = data.video
  return redis_playlist.add(socket.room, video)
}

PLAYLIST.prototype.del = function (socket, io, data) {
  let index = data.index

  return redis_playlist.list(socket.room)
  .then(function (list) {
    list.splice(index, 1)
    return redis_playlist.set(socket.room, list)
  })
}

PLAYLIST.prototype.list = function (socket, io, data) {
  return redis_playlist.list(socket.room)
  .then(function (list) {
    data.locals.list = list
    return Promise.resolve()
  })
}

PLAYLIST.prototype.sendListToTeam = function (socket, io, data) {
  let res = {
    list: data.locals.list
  }
  io.to(socket.room).emit('playlistInit', res)

  return Promise.resolve()
}
module.exports = new PLAYLIST()
