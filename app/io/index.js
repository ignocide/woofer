'use strict'

const redis_paylist = require('../redis/playlist')
const Promise = require('bluebird')


var TEAMDEV = 'team_dev'
module.exports = function (io) {
  io.on('connection', function (socket) {
    console.log('a user connected')

    // 임시로 무조건 개발팀으로 그룹화
    socket.join(TEAMDEV, function (err) {
      socket.room = TEAMDEV
    })

    socket.on('addVideo', function (data) {
      let video = data.video
      redis_paylist.add(socket.room, video)
      .then(function (list) {
        let data = {
          list: list
        }
        io.to(socket.room).emit('playlistInit', data)
      })
    })

    socket.on('delVideo', function (data) {
      let index = data.index

      redis_paylist.list(socket.room)
      .then(function (list) {
        list.splice(index, 1)
        return redis_paylist.set(socket.room, list)
      })
      .then(function (list) {
        let data = {
          list: list
        }
        io.to(socket.room).emit('playlistInit', data)
      })
    })

    socket.on('play', function (data) {
      io.to(socket.room).emit('play', data)
    })

    redis_paylist.list(TEAMDEV)
    .then(function (list) {
      let data = {
        list: list
      }
      io.to(socket.room).emit('playlistInit', data)
    })
  })
}

let toJson = function (arr) {
  for (var key in arr) {
    arr[key] = JSON.parse(arr[key])
  }
}
