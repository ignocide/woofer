'use strict'

const redis_paylist = require('../redis/playlist')
const Promise = require('bluebird')
const api = require('./api')

const team = require('./team')
const playlist = require('./playlist')

var TEAMDEV = 'team_dev'

var IO = function (io) {
  io.on('connection', function (socket) {
    console.log('a user connected')

    // 임시로 무조건 개발팀으로 그룹화
    socket.join(TEAMDEV, function (err) {
      socket.room = TEAMDEV
    })

    redis_paylist.list(TEAMDEV)
    .then(function (list) {
      let data = {
        list: list
      }
      io.to(socket.room).emit('playlistInit', data)
    })

    socket.on('join', function (data) {
      api.runner(socket, io, data,
        team.leave,
        team.join,
        playlist.list,
        playlist.sendListToTeam
      )
    })

    socket.on('leave', function (data) {
      api.runner(socket, io, data,
        team.leave,
        api.callback('leaveCallback')
      )
    })

    socket.on('addVideo', function (data) {
      api.runner(socket, io, data,
        playlist.add,
        playlist.addToTeam
      )
    })

    socket.on('delVideo', function (data) {
      api.runner(socket, io, data,
        playlist.del,
        playlist.delToTeam
      )
    })

    socket.on('play', function (data) {
      io.to(socket.room).emit('play', data)
    })

    socket.on('reqShuffleMode', function (data) {
      io.to(socket.room).emit('reqShuffleMode', data)
    })
  })
}

module.exports = IO
